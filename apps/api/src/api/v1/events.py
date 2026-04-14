"""Gestion des événements et enregistrement de présence (F-609)."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin, CurrentAstronaut
from src.db.session import get_db
from src.models.activity import Activity
from src.repositories.astronaut import AstronautRepository
from src.repositories.event import EventRepository
from src.repositories.point_attribution import PointAttributionRepository
from src.repositories.season import SeasonRepository
from src.schemas.event import AttendanceCreate, AttendanceResult, EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["events"])

_PRESENCE_CATEGORY = "presence"


async def _get_or_create_presence_activity(db: AsyncSession) -> Activity:
    """Retourne l'activité 'Présence événement', la crée si absente."""
    result = await db.execute(
        select(Activity).where(Activity.category == _PRESENCE_CATEGORY)
    )
    activity = result.scalar_one_or_none()
    if activity is None:
        activity = Activity(
            name="Présence événement",
            base_points=0,
            category=_PRESENCE_CATEGORY,
            is_collaborative=False,
            allow_multiple_assignees=False,
            is_active=True,
        )
        db.add(activity)
        await db.flush()
    return activity


@router.get("", response_model=list[EventOut])
async def list_events(
    _current: CurrentAstronaut,
    db: AsyncSession = Depends(get_db),
) -> list[EventOut]:
    repo = EventRepository(db)
    events = await repo.get_all()
    return [EventOut.model_validate(e) for e in events]


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    body: EventCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
) -> EventOut:
    repo = EventRepository(db)
    event = await repo.create(
        name=body.name,
        event_date=body.event_date,
        created_by=admin.id,
    )
    return EventOut.model_validate(event)


@router.get("/{event_id}/attendance", response_model=list[int])
async def get_attendance(
    event_id: int,
    _current: CurrentAstronaut,
    db: AsyncSession = Depends(get_db),
) -> list[int]:
    """Retourne la liste des astronaut_id déjà enregistrés pour cet événement."""
    event_repo = EventRepository(db)
    event = await event_repo.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Événement introuvable.")
    attendances = await event_repo.get_attendances(event_id)
    return [a.astronaut_id for a in attendances]


@router.post("/{event_id}/attendance", response_model=AttendanceResult)
async def record_attendance(
    event_id: int,
    body: AttendanceCreate,
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
) -> AttendanceResult:
    """
    Enregistre la présence d'astronautes à un événement.
    - Idempotent : un astronaute déjà enregistré est ignoré.
    - Si points > 0 : crée une PointAttribution par astronaute (saison active requise).
    """
    event_repo = EventRepository(db)
    event = await event_repo.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Événement introuvable.")

    astronaut_repo = AstronautRepository(db)
    pa_repo = PointAttributionRepository(db)
    season_repo = SeasonRepository(db)

    # Saison active — requise uniquement si on attribue des points
    season = None
    presence_activity = None
    if body.points > 0:
        season = await season_repo.get_active()
        if season is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aucune saison active. Activez une saison pour attribuer des points.",
            )
        presence_activity = await _get_or_create_presence_activity(db)

    recorded = 0
    already_present = 0
    attributions_created = 0

    for astronaut_id in body.astronaut_ids:
        astronaut = await astronaut_repo.get_by_id(astronaut_id)
        if astronaut is None:
            continue

        # Idempotence présence
        if await event_repo.has_attendance(event_id, astronaut_id):
            already_present += 1
            continue

        await event_repo.record_attendance(event_id, astronaut_id)
        recorded += 1

        # Attribution de points si demandé
        if body.points > 0 and season is not None and presence_activity is not None:
            if astronaut.planet_id is None:
                continue  # pas de planète → skip les points

            comment = body.comment or f"Présence : {event.name}"
            await pa_repo.create(
                astronaut_id=astronaut_id,
                planet_id=astronaut.planet_id,
                activity_id=presence_activity.id,
                season_id=season.id,
                awarded_by=admin.id,
                points=body.points,
                comment=comment,
                awarded_at=datetime.now(UTC),
            )
            astronaut.total_points += body.points
            await season_repo.increment_planet_score(
                season_id=season.id,
                planet_id=astronaut.planet_id,
                points=body.points,
            )
            attributions_created += 1

    await db.commit()
    return AttendanceResult(
        event_id=event_id,
        recorded=recorded,
        already_present=already_present,
        attributions_created=attributions_created,
    )
