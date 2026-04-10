from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.repositories.season import SeasonRepository
from src.schemas.season import SeasonCreate, SeasonOut

router = APIRouter(prefix="/seasons", tags=["seasons"])


def _repo(db: AsyncSession = Depends(get_db)) -> SeasonRepository:
    return SeasonRepository(db)


@router.get("", response_model=list[SeasonOut])
async def list_seasons(repo: SeasonRepository = Depends(_repo)) -> list[SeasonOut]:
    seasons = await repo.get_all()
    return [SeasonOut.model_validate(s) for s in seasons]


@router.get("/active", response_model=SeasonOut | None)
async def get_active_season(repo: SeasonRepository = Depends(_repo)) -> SeasonOut | None:
    season = await repo.get_active()
    return SeasonOut.model_validate(season) if season else None


@router.post("", response_model=SeasonOut, status_code=status.HTTP_201_CREATED)
async def create_season(
    body: SeasonCreate,
    _admin: CurrentAdmin,
    repo: SeasonRepository = Depends(_repo),
) -> SeasonOut:
    season = await repo.create(**body.model_dump())
    return SeasonOut.model_validate(season)


@router.post("/{season_id}/activate", response_model=SeasonOut)
async def activate_season(
    season_id: int,
    _admin: CurrentAdmin,
    repo: SeasonRepository = Depends(_repo),
) -> SeasonOut:
    season = await repo.get_by_id(season_id)
    if season is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saison introuvable")
    season = await repo.activate(season)
    return SeasonOut.model_validate(season)


@router.post("/{season_id}/close", response_model=SeasonOut)
async def close_season(
    season_id: int,
    _admin: CurrentAdmin,
    repo: SeasonRepository = Depends(_repo),
) -> SeasonOut:
    """Clôture une saison : désactive + reset des compteurs planète."""
    season = await repo.get_by_id(season_id)
    if season is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saison introuvable")
    if not season.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seule la saison active peut être clôturée",
        )
    await repo.reset_planet_scores(season_id)
    season.is_active = False
    await repo.get_by_id(season_id)  # refresh
    return SeasonOut.model_validate(season)
