"""Service d'attribution de points — règles métier critiques.

Règles appliquées dans l'ordre :
1. Validation : saison active, activité existante, multi-assignee autorisé
2. F-303 : multiplicateur ×2 si 1ère contribution ever de l'astronaute
3. F-304 : bonus +25 pts si 1ère contribution de la saison
4. Sauvegarde immuable de la PointAttribution
5. Mise à jour de astronaut.total_points
6. Mise à jour du compteur planète de la saison
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.astronaut import Astronaut
from src.models.point_attribution import PointAttribution
from src.repositories.activity import ActivityRepository
from src.repositories.astronaut import AstronautRepository
from src.repositories.point_attribution import PointAttributionRepository
from src.repositories.season import SeasonRepository

FIRST_SEASON_BONUS = 25
FIRST_EVER_MULTIPLIER = 2


class PointAttributionService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._pa_repo = PointAttributionRepository(db)
        self._astronaut_repo = AstronautRepository(db)
        self._activity_repo = ActivityRepository(db)
        self._season_repo = SeasonRepository(db)

    async def attribute_points(
        self,
        astronaut_ids: list[int],
        activity_id: int,
        awarded_by: Astronaut,
        custom_points: int | None = None,
        comment: str | None = None,
    ) -> list[PointAttribution]:
        """
        Attribue des points à un ou plusieurs astronautes.
        Applique les modificateurs F-303 et F-304 individuellement.
        """
        # Validation — saison active
        season = await self._season_repo.get_active()
        if season is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aucune saison active. Activez une saison avant d'attribuer des points.",
            )

        # Validation — activité
        activity = await self._activity_repo.get_by_id(activity_id)
        if activity is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Activité {activity_id} introuvable.",
            )

        # Validation — multi-assignee
        if len(astronaut_ids) > 1 and not activity.allow_multiple_assignees:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"L'activité '{activity.name}' n'autorise pas plusieurs co-auteurs. "
                    "Activez 'allow_multiple_assignees' sur l'activité."
                ),
            )

        base_points = custom_points if custom_points is not None else activity.base_points
        attributions: list[PointAttribution] = []

        for astronaut_id in astronaut_ids:
            astronaut = await self._astronaut_repo.get_by_id(astronaut_id)
            if astronaut is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Astronaute {astronaut_id} introuvable.",
                )
            if astronaut.planet_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"L'astronaute {astronaut.email} n'est rattaché à aucune planète. "
                        "Affectez-le à une planète avant d'attribuer des points."
                    ),
                )

            # F-303 : 1ère contribution ever ?
            total_attributions = await self._pa_repo.count_by_astronaut(astronaut_id)
            is_first_ever = total_attributions == 0

            # F-304 : 1ère contribution de la saison ?
            season_attributions = await self._pa_repo.count_by_astronaut_and_season(
                astronaut_id, season.id
            )
            is_first_of_season = season_attributions == 0

            # Calcul des points finaux
            final_points = base_points
            if is_first_ever:
                final_points *= FIRST_EVER_MULTIPLIER
            if is_first_of_season:
                final_points += FIRST_SEASON_BONUS

            # Création de l'attribution (immuable)
            attribution = await self._pa_repo.create(
                astronaut_id=astronaut_id,
                planet_id=astronaut.planet_id,
                activity_id=activity_id,
                season_id=season.id,
                awarded_by=awarded_by.id,
                points=final_points,
                comment=comment,
                first_ever_multiplier_applied=is_first_ever,
                first_season_bonus_applied=is_first_of_season,
            )

            # Mise à jour astronaut.total_points
            astronaut.total_points += final_points

            # Mise à jour compteur planète
            await self._season_repo.increment_planet_score(
                season_id=season.id,
                planet_id=astronaut.planet_id,
                points=final_points,
            )

            attributions.append(attribution)

        await self._db.commit()
        for a in attributions:
            await self._db.refresh(a)

        return attributions

    async def list_enriched(
        self,
        planet_id: int | None = None,
        astronaut_id: int | None = None,
    ) -> list[PointAttribution]:
        """Retourne les attributions avec activity_name et noms d'astronaute enrichis."""
        from src.schemas.point_attribution import (
            PointAttributionOut,  # local import to avoid circular
        )

        active = await self._season_repo.get_active()
        season_id = active.id if active else None

        if planet_id is not None:
            rows = await self._pa_repo.get_by_planet(planet_id, season_id=season_id)
        elif astronaut_id is not None:
            rows = await self._pa_repo.get_by_astronaut(astronaut_id)
        else:
            rows = []

        activity_ids = list({r.activity_id for r in rows})
        astronaut_ids = list({r.astronaut_id for r in rows})

        activity_map = {a.id: a for a in await self._activity_repo.get_by_ids(activity_ids)}
        astronaut_map = {a.id: a for a in await self._astronaut_repo.get_by_ids(astronaut_ids)}

        result: list[PointAttribution] = []
        for r in rows:
            out = PointAttributionOut.model_validate(r)
            activity = activity_map.get(r.activity_id)
            out.activity_name = activity.name if activity else None
            astronaut = astronaut_map.get(r.astronaut_id)
            if astronaut:
                out.astronaut_first_name = astronaut.first_name
                out.astronaut_last_name = astronaut.last_name
            result.append(out)  # type: ignore[arg-type]
        return result

    async def delete_attribution(
        self,
        attribution_id: int,
        deleted_by: Astronaut,
        reason: str,
    ) -> PointAttribution:
        """Soft-delete d'une attribution avec recalcul des compteurs."""
        attribution = await self._pa_repo.get_by_id(attribution_id)
        if attribution is None or attribution.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attribution introuvable.",
            )

        points = attribution.points

        # Recalcul astronaut.total_points
        astronaut = await self._astronaut_repo.get_by_id(attribution.astronaut_id)
        if astronaut is not None:
            astronaut.total_points = max(0, astronaut.total_points - points)

        # Recalcul compteur planète
        await self._season_repo.decrement_planet_score(
            season_id=attribution.season_id,
            planet_id=attribution.planet_id,
            points=points,
        )

        return await self._pa_repo.soft_delete(
            attribution=attribution,
            deleted_by=deleted_by.id,
            reason=reason,
        )
