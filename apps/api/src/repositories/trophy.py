from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.trophy import Trophy
from src.models.trophy_attribution import TrophyAttribution


class TrophyRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ── Trophy CRUD ───────────────────────────────────────────────────────────

    async def get_all(self) -> list[Trophy]:
        result = await self._db.execute(select(Trophy).order_by(Trophy.created_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, trophy_id: int) -> Trophy | None:
        result = await self._db.execute(select(Trophy).where(Trophy.id == trophy_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Trophy:
        trophy = Trophy(**kwargs)
        self._db.add(trophy)
        await self._db.commit()
        await self._db.refresh(trophy)
        return trophy

    async def update(self, trophy: Trophy, **kwargs: object) -> Trophy:
        for key, value in kwargs.items():
            setattr(trophy, key, value)
        await self._db.commit()
        await self._db.refresh(trophy)
        return trophy

    async def delete(self, trophy: Trophy) -> None:
        await self._db.delete(trophy)
        await self._db.commit()

    # ── TrophyAttribution ─────────────────────────────────────────────────────

    async def get_attributions_by_astronaut(
        self, astronaut_id: int
    ) -> list[TrophyAttribution]:
        result = await self._db.execute(
            select(TrophyAttribution)
            .where(TrophyAttribution.astronaut_id == astronaut_id)
            .order_by(TrophyAttribution.awarded_at.desc())
        )
        return list(result.scalars().all())

    async def get_attributions_by_planet(
        self, planet_id: int
    ) -> list[TrophyAttribution]:
        result = await self._db.execute(
            select(TrophyAttribution)
            .where(TrophyAttribution.planet_id == planet_id)
            .order_by(TrophyAttribution.awarded_at.desc())
        )
        return list(result.scalars().all())

    async def create_attribution(self, **kwargs: object) -> TrophyAttribution:
        attribution = TrophyAttribution(**kwargs)
        self._db.add(attribution)
        await self._db.commit()
        await self._db.refresh(attribution)
        return attribution

    async def get_attribution_by_id(self, attribution_id: int) -> TrophyAttribution | None:
        result = await self._db.execute(
            select(TrophyAttribution).where(TrophyAttribution.id == attribution_id)
        )
        return result.scalar_one_or_none()

    async def delete_attribution(self, attribution: TrophyAttribution) -> None:
        await self._db.delete(attribution)
        await self._db.commit()
