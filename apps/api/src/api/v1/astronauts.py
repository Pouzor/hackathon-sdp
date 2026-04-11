import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.models.astronaut import Astronaut
from src.models.grade import Grade
from src.repositories.astronaut import AstronautRepository
from src.repositories.grade import GradeRepository
from src.schemas.astronaut import AstronautOut, AstronautRoleUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/astronauts", tags=["astronauts"])


def _astronaut_repo(db: AsyncSession = Depends(get_db)) -> AstronautRepository:
    return AstronautRepository(db)


def _grade_repo(db: AsyncSession = Depends(get_db)) -> GradeRepository:
    return GradeRepository(db)


def _resolve_grade(total_points: int, grades: list[Grade]) -> Grade | None:
    """Retourne le grade le plus élevé dont le seuil est ≤ total_points (résolution en mémoire)."""
    eligible = [g for g in grades if g.threshold_points <= total_points]
    return max(eligible, key=lambda g: g.threshold_points, default=None)


def _enrich(astronaut: Astronaut, grade: Grade | None) -> AstronautOut:
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
    grades = await grade_repo.get_all()
    return [_enrich(a, _resolve_grade(a.total_points, grades)) for a in astronauts]


@router.get("/{astronaut_id}", response_model=AstronautOut)
async def get_astronaut(
    astronaut_id: int,
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    astronaut = await astronaut_repo.get_by_id(astronaut_id)
    if astronaut is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")
    grades = await grade_repo.get_all()
    return _enrich(astronaut, _resolve_grade(astronaut.total_points, grades))


@router.patch("/{astronaut_id}/roles", response_model=AstronautOut)
async def update_astronaut_roles(
    astronaut_id: int,
    body: AstronautRoleUpdate,
    current_admin: CurrentAdmin,
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    """Met à jour les rôles d'un astronaute (admin uniquement).
    Un admin ne peut pas se retirer lui-même le rôle admin.
    """
    if current_admin.id == astronaut_id and "admin" not in body.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Un admin ne peut pas se retirer lui-même le rôle admin",
        )

    target = await astronaut_repo.get_by_id(astronaut_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")

    new_roles = list(set(body.roles))
    updated = await astronaut_repo.update_roles(target, new_roles)

    logger.info(
        "roles_updated admin=%s target=%s old_roles=%s new_roles=%s",
        current_admin.email,
        updated.email,
        target.roles,
        new_roles,
    )

    grades = await grade_repo.get_all()
    return _enrich(updated, _resolve_grade(updated.total_points, grades))
