from datetime import UTC, datetime

from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.point_attribution import PointAttribution


class PointAttributionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def count_by_astronaut(self, astronaut_id: int) -> int:
        """Nombre total d'attributions non supprimées pour un astronaute."""
        result = await self._db.execute(
            select(func.count()).where(
                PointAttribution.astronaut_id == astronaut_id,
                PointAttribution.is_deleted.is_(False),
            )
        )
        return int(result.scalar() or 0)

    async def count_by_astronaut_and_season(self, astronaut_id: int, season_id: int) -> int:
        """Nombre d'attributions pour un astronaute dans une saison donnée."""
        result = await self._db.execute(
            select(func.count()).where(
                PointAttribution.astronaut_id == astronaut_id,
                PointAttribution.season_id == season_id,
                PointAttribution.is_deleted.is_(False),
            )
        )
        return int(result.scalar() or 0)

    async def get_by_astronaut(
        self, astronaut_id: int, limit: int = 20, offset: int = 0
    ) -> list[PointAttribution]:
        result = await self._db.execute(
            select(PointAttribution)
            .where(
                PointAttribution.astronaut_id == astronaut_id,
                PointAttribution.is_deleted.is_(False),
            )
            .order_by(PointAttribution.awarded_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_by_planet(
        self, planet_id: int, season_id: int | None = None, limit: int = 50
    ) -> list[PointAttribution]:
        q = select(PointAttribution).where(
            PointAttribution.planet_id == planet_id,
            PointAttribution.is_deleted.is_(False),
        )
        if season_id is not None:
            q = q.where(PointAttribution.season_id == season_id)
        q = q.order_by(PointAttribution.awarded_at.desc()).limit(limit)
        result = await self._db.execute(q)
        return list(result.scalars().all())

    async def has_seniority_attribution(
        self, astronaut_id: int, activity_id: int, year: int
    ) -> bool:
        """Vérifie si une attribution d'ancienneté existe déjà pour cet astronaute cette année."""
        result = await self._db.execute(
            select(func.count()).where(
                PointAttribution.astronaut_id == astronaut_id,
                PointAttribution.activity_id == activity_id,
                extract("year", PointAttribution.awarded_at) == year,
                PointAttribution.is_deleted.is_(False),
            )
        )
        return int(result.scalar() or 0) > 0

    async def get_recent(self, limit: int = 10) -> list[PointAttribution]:
        """Retourne les N dernières attributions non supprimées."""
        result = await self._db.execute(
            select(PointAttribution)
            .where(PointAttribution.is_deleted.is_(False))
            .order_by(PointAttribution.awarded_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, attribution_id: int) -> PointAttribution | None:
        result = await self._db.execute(
            select(PointAttribution).where(PointAttribution.id == attribution_id)
        )
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> PointAttribution:
        attribution = PointAttribution(**kwargs)
        self._db.add(attribution)
        await self._db.flush()  # flush pour obtenir l'id avant commit
        return attribution

    async def soft_delete(
        self,
        attribution: PointAttribution,
        deleted_by: int,
        reason: str,
    ) -> PointAttribution:
        attribution.is_deleted = True
        attribution.deleted_by = deleted_by
        attribution.deletion_reason = reason
        attribution.deleted_at = datetime.now(UTC)
        await self._db.commit()
        await self._db.refresh(attribution)
        return attribution
