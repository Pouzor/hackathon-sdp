from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.grade import Grade


class GradeRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Grade]:
        result = await self._db.execute(select(Grade).order_by(Grade.order))
        return list(result.scalars().all())

    async def get_by_id(self, grade_id: int) -> Grade | None:
        result = await self._db.execute(select(Grade).where(Grade.id == grade_id))
        return result.scalar_one_or_none()

    async def get_for_points(self, total_points: int) -> Grade | None:
        """Retourne le grade le plus élevé dont le seuil est ≤ total_points."""
        result = await self._db.execute(
            select(Grade)
            .where(Grade.threshold_points <= total_points)
            .order_by(Grade.threshold_points.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Grade:
        grade = Grade(**kwargs)
        self._db.add(grade)
        await self._db.commit()
        await self._db.refresh(grade)
        return grade

    async def update(self, grade: Grade, **kwargs: object) -> Grade:
        for key, value in kwargs.items():
            setattr(grade, key, value)
        await self._db.commit()
        await self._db.refresh(grade)
        return grade

    async def delete(self, grade: Grade) -> None:
        await self._db.delete(grade)
        await self._db.commit()
