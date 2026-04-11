from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.models.astronaut import Astronaut
from src.repositories.astronaut import AstronautRepository
from src.repositories.grade import GradeRepository
from src.schemas.astronaut import AstronautOut

router = APIRouter(prefix="/astronauts", tags=["astronauts"])


def _astronaut_repo(db: AsyncSession = Depends(get_db)) -> AstronautRepository:
    return AstronautRepository(db)


def _grade_repo(db: AsyncSession = Depends(get_db)) -> GradeRepository:
    return GradeRepository(db)


async def _enrich(
    astronaut: Astronaut,
    grade_repo: GradeRepository,
) -> AstronautOut:
    """Enrichit un astronaute avec son grade calculé."""
    grade = await grade_repo.get_for_points(astronaut.total_points)
    out = AstronautOut.model_validate(astronaut)
    out.grade_name = grade.name if grade else None
    return out


@router.get("", response_model=list[AstronautOut])
async def list_astronauts(
    planet_id: int | None = Query(None, description="Filtrer par planète"),
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> list[AstronautOut]:
    astronauts = await astronaut_repo.get_all(planet_id=planet_id)
    return [await _enrich(a, grade_repo) for a in astronauts]


@router.get("/{astronaut_id}", response_model=AstronautOut)
async def get_astronaut(
    astronaut_id: int,
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    astronaut = await astronaut_repo.get_by_id(astronaut_id)
    if astronaut is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")
    return await _enrich(astronaut, grade_repo)
