from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.models.planet import Planet
from src.repositories.planet import PlanetRepository
from src.repositories.season import SeasonRepository
from src.schemas.planet import PlanetCreate, PlanetOut, PlanetUpdate

router = APIRouter(prefix="/planets", tags=["planets"])


def _repo(db: AsyncSession = Depends(get_db)) -> PlanetRepository:
    return PlanetRepository(db)


def _season_repo(db: AsyncSession = Depends(get_db)) -> SeasonRepository:
    return SeasonRepository(db)


async def _enrich(
    planet: Planet,
    season_repo: SeasonRepository,
    active_season_id: int | None,
) -> PlanetOut:
    """Enrichit une planète avec le score de la saison active."""
    out = PlanetOut.model_validate(planet)
    if active_season_id is not None:
        score_row = await season_repo.get_or_create_planet_score(active_season_id, planet.id)
        out.season_score = score_row.points
    return out


@router.get("", response_model=list[PlanetOut])
async def list_planets(
    repo: PlanetRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
) -> list[PlanetOut]:
    planets = await repo.get_all()
    active = await season_repo.get_active()
    active_season_id = active.id if active else None
    return [await _enrich(p, season_repo, active_season_id) for p in planets]


@router.get("/{planet_id}", response_model=PlanetOut)
async def get_planet(
    planet_id: int,
    repo: PlanetRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
) -> PlanetOut:
    planet = await repo.get_by_id(planet_id)
    if planet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planète introuvable")
    active = await season_repo.get_active()
    return await _enrich(planet, season_repo, active.id if active else None)


@router.post("", response_model=PlanetOut, status_code=status.HTTP_201_CREATED)
async def create_planet(
    body: PlanetCreate,
    _admin: CurrentAdmin,
    repo: PlanetRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
) -> PlanetOut:
    existing = await repo.get_by_name(body.name)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Nom de planète déjà utilisé"
        )
    planet = await repo.create(**body.model_dump())
    active = await season_repo.get_active()
    return await _enrich(planet, season_repo, active.id if active else None)


@router.patch("/{planet_id}", response_model=PlanetOut)
async def update_planet(
    planet_id: int,
    body: PlanetUpdate,
    _admin: CurrentAdmin,
    repo: PlanetRepository = Depends(_repo),
    season_repo: SeasonRepository = Depends(_season_repo),
) -> PlanetOut:
    planet = await repo.get_by_id(planet_id)
    if planet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planète introuvable")
    updates = body.model_dump(exclude_unset=True)
    planet = await repo.update(planet, **updates)
    active = await season_repo.get_active()
    return await _enrich(planet, season_repo, active.id if active else None)


@router.delete("/{planet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_planet(
    planet_id: int,
    _admin: CurrentAdmin,
    repo: PlanetRepository = Depends(_repo),
) -> None:
    planet = await repo.get_by_id(planet_id)
    if planet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planète introuvable")
    await repo.delete(planet)
