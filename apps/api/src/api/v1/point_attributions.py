from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.schemas.point_attribution import (
    PointAttributionCreate,
    PointAttributionDeleteRequest,
    PointAttributionOut,
)
from src.services.point_attribution import PointAttributionService

router = APIRouter(prefix="/point-attributions", tags=["point-attributions"])


def _service(db: AsyncSession = Depends(get_db)) -> PointAttributionService:
    return PointAttributionService(db)


@router.get("", response_model=list[PointAttributionOut])
async def list_attributions(
    planet_id: int | None = Query(None),
    astronaut_id: int | None = Query(None),
    service: PointAttributionService = Depends(_service),
) -> list[PointAttributionOut]:
    return await service.list_enriched(planet_id=planet_id, astronaut_id=astronaut_id)  # type: ignore[return-value]


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
