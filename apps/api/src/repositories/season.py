from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.season import Season
from src.models.season_planet_score import SeasonPlanetScore


class SeasonRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_active(self) -> Season | None:
        result = await self._db.execute(select(Season).where(Season.is_active.is_(True)))
        return result.scalar_one_or_none()

    async def get_by_id(self, season_id: int) -> Season | None:
        result = await self._db.execute(select(Season).where(Season.id == season_id))
        return result.scalar_one_or_none()

    async def get_all(self) -> list[Season]:
        result = await self._db.execute(select(Season).order_by(Season.start_date.desc()))
        return list(result.scalars().all())

    async def create(self, **kwargs: object) -> Season:
        season = Season(**kwargs)
        self._db.add(season)
        await self._db.commit()
        await self._db.refresh(season)
        return season

    async def deactivate_all(self) -> None:
        await self._db.execute(update(Season).values(is_active=False))

    async def activate(self, season: Season) -> Season:
        await self.deactivate_all()
        season.is_active = True
        await self._db.commit()
        await self._db.refresh(season)
        return season

    async def get_or_create_planet_score(self, season_id: int, planet_id: int) -> SeasonPlanetScore:
        result = await self._db.execute(
            select(SeasonPlanetScore).where(
                SeasonPlanetScore.season_id == season_id,
                SeasonPlanetScore.planet_id == planet_id,
            )
        )
        score = result.scalar_one_or_none()
        if score is None:
            score = SeasonPlanetScore(season_id=season_id, planet_id=planet_id, points=0)
            self._db.add(score)
            await self._db.flush()
        return score

    async def increment_planet_score(self, season_id: int, planet_id: int, points: int) -> None:
        score = await self.get_or_create_planet_score(season_id, planet_id)
        score.points += points
        await self._db.commit()

    async def decrement_planet_score(self, season_id: int, planet_id: int, points: int) -> None:
        score = await self.get_or_create_planet_score(season_id, planet_id)
        score.points = max(0, score.points - points)
        await self._db.commit()

    async def reset_planet_scores(self, season_id: int) -> None:
        """Reset tous les compteurs planète d'une saison (clôture)."""
        await self._db.execute(
            update(SeasonPlanetScore)
            .where(SeasonPlanetScore.season_id == season_id)
            .values(points=0)
        )
        await self._db.commit()
