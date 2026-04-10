from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.planet import Planet


class PlanetRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Planet]:
        result = await self._db.execute(select(Planet).order_by(Planet.name))
        return list(result.scalars().all())

    async def get_by_id(self, planet_id: int) -> Planet | None:
        result = await self._db.execute(select(Planet).where(Planet.id == planet_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Planet | None:
        result = await self._db.execute(select(Planet).where(Planet.name == name))
        return result.scalar_one_or_none()

    async def get_competing(self) -> list[Planet]:
        result = await self._db.execute(
            select(Planet).where(Planet.is_competing.is_(True)).order_by(Planet.name)
        )
        return list(result.scalars().all())

    async def get_default_for_newcomers(self) -> Planet | None:
        result = await self._db.execute(
            select(Planet).where(Planet.is_default_for_newcomers.is_(True))
        )
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Planet:
        planet = Planet(**kwargs)
        self._db.add(planet)
        await self._db.commit()
        await self._db.refresh(planet)
        return planet

    async def update(self, planet: Planet, **kwargs: object) -> Planet:
        for key, value in kwargs.items():
            setattr(planet, key, value)
        await self._db.commit()
        await self._db.refresh(planet)
        return planet

    async def delete(self, planet: Planet) -> None:
        await self._db.delete(planet)
        await self._db.commit()
