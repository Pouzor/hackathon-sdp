from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.event import Event, EventAttendance


class EventRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_all(self) -> list[Event]:
        result = await self._db.execute(select(Event).order_by(Event.event_date.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, event_id: int) -> Event | None:
        result = await self._db.execute(select(Event).where(Event.id == event_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Event:
        event = Event(**kwargs)
        self._db.add(event)
        await self._db.commit()
        await self._db.refresh(event)
        return event

    async def has_attendance(self, event_id: int, astronaut_id: int) -> bool:
        result = await self._db.execute(
            select(EventAttendance).where(
                EventAttendance.event_id == event_id,
                EventAttendance.astronaut_id == astronaut_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def record_attendance(self, event_id: int, astronaut_id: int) -> EventAttendance:
        attendance = EventAttendance(event_id=event_id, astronaut_id=astronaut_id)
        self._db.add(attendance)
        await self._db.flush()
        return attendance

    async def count_attendances_by_event(self, event_ids: list[int]) -> dict[int, int]:
        """Retourne un dict {event_id: count} pour la liste d'IDs donnée."""
        if not event_ids:
            return {}
        result = await self._db.execute(
            select(EventAttendance.event_id, func.count().label("cnt"))
            .where(EventAttendance.event_id.in_(event_ids))
            .group_by(EventAttendance.event_id)
        )
        return {row.event_id: row.cnt for row in result}

    async def get_attendances(self, event_id: int) -> list[EventAttendance]:
        result = await self._db.execute(
            select(EventAttendance).where(EventAttendance.event_id == event_id)
        )
        return list(result.scalars().all())
