from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.repositories.activity import ActivityRepository
from src.repositories.astronaut import AstronautRepository
from src.repositories.point_attribution import PointAttributionRepository
from src.repositories.season import SeasonRepository
from src.schemas.point_attribution import (
    PointAttributionCreate,
    PointAttributionDeleteRequest,
    PointAttributionOut,
)
from src.services.point_attribution import PointAttributionService

router = APIRouter(prefix="/point-attributions", tags=["point-attributions"])


def _service(db: AsyncSession = Depends(get_db)) -> PointAttributionService:
    return PointAttributionService(db)


def _repo(db: AsyncSession = Depends(get_db)) -> PointAttributionRepository:
    return PointAttributionRepository(db)


def _season_repo(db: AsyncSession = Depends(get_db)) -> SeasonRepository:
    return SeasonRepository(db)


def _activity_repo(db: AsyncSession = Depends(get_db)) -> ActivityRepository:
    return ActivityRepository(db)


def _astronaut_repo(db: AsyncSession = Depends(get_db)) -> AstronautRepository:
    return AstronautRepository(db)


@router.get("", response_model=list[PointAttributionOut])
async def list_attributions(
    planet_id: int | None = Query(None),
    astronaut_id: int | None = Query(None),
    repo: PointAttributionRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
    activity_repo: ActivityRepository = Depends(_activity_repo),
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
) -> list[PointAttributionOut]:
    active = await season_repo.get_active()
    season_id = active.id if active else None
    if planet_id is not None:
        rows = await repo.get_by_planet(planet_id, season_id=season_id)
    elif astronaut_id is not None:
        rows = await repo.get_by_astronaut(astronaut_id)
    else:
        rows = []

    # Batch-fetch with WHERE IN to avoid N+1 queries
    activity_ids = list({r.activity_id for r in rows})
    astronaut_ids = list({r.astronaut_id for r in rows})

    activity_map = {a.id: a for a in await activity_repo.get_by_ids(activity_ids)}
    astronaut_map = {a.id: a for a in await astronaut_repo.get_by_ids(astronaut_ids)}

    result = []
    for r in rows:
        out = PointAttributionOut.model_validate(r)
        activity = activity_map.get(r.activity_id)
        out.activity_name = activity.name if activity else None
        astronaut = astronaut_map.get(r.astronaut_id)
        if astronaut:
            out.astronaut_first_name = astronaut.first_name
            out.astronaut_last_name = astronaut.last_name
        result.append(out)
    return result


@router.post("", response_model=list[PointAttributionOut], status_code=status.HTTP_201_CREATED)
async def create_attribution(
    body: PointAttributionCreate,
    admin: CurrentAdmin,
    service: PointAttributionService = Depends(_service),
) -> list[PointAttributionOut]:
    attributions = await service.attribute_points(
        astronaut_ids=body.astronaut_ids,
        activity_id=body.activity_id,
        awarded_by=admin,
        custom_points=body.points,
        comment=body.comment,
    )
    return [PointAttributionOut.model_validate(a) for a in attributions]


@router.delete("/{attribution_id}", response_model=PointAttributionOut)
async def delete_attribution(
    attribution_id: int,
    body: PointAttributionDeleteRequest,
    admin: CurrentAdmin,
    service: PointAttributionService = Depends(_service),
) -> PointAttributionOut:
    attribution = await service.delete_attribution(
        attribution_id=attribution_id,
        deleted_by=admin,
        reason=body.reason,
    )
    return PointAttributionOut.model_validate(attribution)
