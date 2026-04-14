from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.astronaut import Astronaut


class AstronautRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self, planet_id: int | None = None) -> list[Astronaut]:
        q = select(Astronaut).order_by(Astronaut.total_points.desc())
        if planet_id is not None:
            q = q.where(Astronaut.planet_id == planet_id)
        result = await self._db.execute(q)
        return list(result.scalars().all())

    async def get_by_email(self, email: str) -> Astronaut | None:
        result = await self._db.execute(select(Astronaut).where(Astronaut.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, astronaut_id: int) -> Astronaut | None:
        result = await self._db.execute(select(Astronaut).where(Astronaut.id == astronaut_id))
        return result.scalar_one_or_none()

    async def get_by_ids(self, astronaut_ids: list[int]) -> list[Astronaut]:
        if not astronaut_ids:
            return []
        result = await self._db.execute(select(Astronaut).where(Astronaut.id.in_(astronaut_ids)))
        return list(result.scalars().all())

    async def create(
        self,
        email: str,
        first_name: str,
        last_name: str,
        photo_url: str | None = None,
        planet_id: int | None = None,
        hire_date: date | None = None,
    ) -> Astronaut:
        astronaut = Astronaut(
            email=email,
            first_name=first_name,
            last_name=last_name,
            photo_url=photo_url,
            planet_id=planet_id,
            hire_date=hire_date,
            roles=["astronaut"],
        )
        self._db.add(astronaut)
        await self._db.commit()
        await self._db.refresh(astronaut)
        return astronaut

    async def update_profile(
        self,
        astronaut: Astronaut,
        fields: dict[str, object],
    ) -> Astronaut:
        """Met à jour les champs de profil fournis (clés de `fields` uniquement)."""
        for key, value in fields.items():
            setattr(astronaut, key, value)
        await self._db.commit()
        await self._db.refresh(astronaut)
        return astronaut

    async def update_roles(self, astronaut: Astronaut, roles: list[str]) -> Astronaut:
        """Met à jour les rôles d'un astronaute."""
        astronaut.roles = roles
        await self._db.commit()
        await self._db.refresh(astronaut)
        return astronaut
