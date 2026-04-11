from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.activity import Activity


class ActivityRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self, active_only: bool = True) -> list[Activity]:
        stmt = select(Activity).order_by(Activity.name)
        if active_only:
            stmt = stmt.where(Activity.is_active.is_(True))
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, activity_id: int) -> Activity | None:
        result = await self._db.execute(select(Activity).where(Activity.id == activity_id))
        return result.scalar_one_or_none()

    async def get_by_ids(self, activity_ids: list[int]) -> list[Activity]:
        if not activity_ids:
            return []
        result = await self._db.execute(select(Activity).where(Activity.id.in_(activity_ids)))
        return list(result.scalars().all())

    async def create(self, **kwargs: object) -> Activity:
        activity = Activity(**kwargs)
        self._db.add(activity)
        await self._db.commit()
        await self._db.refresh(activity)
        return activity

    async def update(self, activity: Activity, **kwargs: object) -> Activity:
        for key, value in kwargs.items():
            setattr(activity, key, value)
        await self._db.commit()
        await self._db.refresh(activity)
        return activity
