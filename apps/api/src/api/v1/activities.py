from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.repositories.activity import ActivityRepository
from src.schemas.activity import ActivityCreate, ActivityOut, ActivityUpdate

router = APIRouter(prefix="/activities", tags=["activities"])


def _repo(db: AsyncSession = Depends(get_db)) -> ActivityRepository:
    return ActivityRepository(db)


@router.get("", response_model=list[ActivityOut])
async def list_activities(repo: ActivityRepository = Depends(_repo)) -> list[ActivityOut]:
    activities = await repo.get_all()
    return [ActivityOut.model_validate(a) for a in activities]


@router.get("/{activity_id}", response_model=ActivityOut)
async def get_activity(activity_id: int, repo: ActivityRepository = Depends(_repo)) -> ActivityOut:
    activity = await repo.get_by_id(activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activité introuvable")
    return ActivityOut.model_validate(activity)


@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
async def create_activity(
    body: ActivityCreate,
    _admin: CurrentAdmin,
    repo: ActivityRepository = Depends(_repo),
) -> ActivityOut:
    activity = await repo.create(**body.model_dump())
    return ActivityOut.model_validate(activity)


@router.patch("/{activity_id}", response_model=ActivityOut)
async def update_activity(
    activity_id: int,
    body: ActivityUpdate,
    _admin: CurrentAdmin,
    repo: ActivityRepository = Depends(_repo),
) -> ActivityOut:
    activity = await repo.get_by_id(activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activité introuvable")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    activity = await repo.update(activity, **updates)
    return ActivityOut.model_validate(activity)
