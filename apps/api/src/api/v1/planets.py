from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.repositories.planet import PlanetRepository
from src.schemas.planet import PlanetCreate, PlanetOut, PlanetUpdate

router = APIRouter(prefix="/planets", tags=["planets"])


def _repo(db: AsyncSession = Depends(get_db)) -> PlanetRepository:
    return PlanetRepository(db)


@router.get("", response_model=list[PlanetOut])
async def list_planets(repo: PlanetRepository = Depends(_repo)) -> list[PlanetOut]:
    planets = await repo.get_all()
    return [PlanetOut.model_validate(p) for p in planets]


@router.get("/{planet_id}", response_model=PlanetOut)
async def get_planet(planet_id: int, repo: PlanetRepository = Depends(_repo)) -> PlanetOut:
    planet = await repo.get_by_id(planet_id)
    if planet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planète introuvable")
    return PlanetOut.model_validate(planet)


@router.post("", response_model=PlanetOut, status_code=status.HTTP_201_CREATED)
async def create_planet(
    body: PlanetCreate,
    _admin: CurrentAdmin,
    repo: PlanetRepository = Depends(_repo),
) -> PlanetOut:
    existing = await repo.get_by_name(body.name)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nom de planète déjà utilisé")
    planet = await repo.create(**body.model_dump())
    return PlanetOut.model_validate(planet)


@router.patch("/{planet_id}", response_model=PlanetOut)
async def update_planet(
    planet_id: int,
    body: PlanetUpdate,
    _admin: CurrentAdmin,
    repo: PlanetRepository = Depends(_repo),
) -> PlanetOut:
    planet = await repo.get_by_id(planet_id)
    if planet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Planète introuvable")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    planet = await repo.update(planet, **updates)
    return PlanetOut.model_validate(planet)


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
