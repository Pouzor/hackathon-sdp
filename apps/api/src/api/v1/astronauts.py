import asyncio
import logging
import time
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin, CurrentAstronaut
from src.db.session import get_db
from src.models.astronaut import Astronaut
from src.models.grade import Grade
from src.repositories.astronaut import AstronautRepository
from src.repositories.grade import GradeRepository
from src.schemas.astronaut import (
    ADMIN_ONLY_FIELDS,
    AstronautOut,
    AstronautPatch,
    AstronautRoleUpdate,
)

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads/avatars")
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 Mo

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
    _current: CurrentAstronaut,
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
    _current: CurrentAstronaut,
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    astronaut = await astronaut_repo.get_by_id(astronaut_id)
    if astronaut is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")
    grades = await grade_repo.get_all()
    return _enrich(astronaut, _resolve_grade(astronaut.total_points, grades))


@router.patch("/{astronaut_id}", response_model=AstronautOut)
async def update_astronaut_profile(
    astronaut_id: int,
    body: AstronautPatch,
    current: CurrentAstronaut,
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    """Met à jour le profil d'un astronaute.
    L'astronaute ne peut modifier que son propre profil (photo_url, hobbies, client).
    Un admin peut en plus modifier : planet_id, hire_date, first_name, last_name.
    """
    is_admin = "admin" in current.roles
    if current.id != astronaut_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que votre propre profil",
        )

    target = await astronaut_repo.get_by_id(astronaut_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")

    all_fields = body.model_dump(exclude_unset=True)
    # Filtre les champs admin-only si le requérant n'est pas admin
    if not is_admin:
        all_fields = {k: v for k, v in all_fields.items() if k not in ADMIN_ONLY_FIELDS}

    updated = await astronaut_repo.update_profile(target, all_fields)
    logger.info(
        "profile_updated by=%s target_id=%s fields=%s",
        current.email,
        astronaut_id,
        list(all_fields.keys()),
    )

    grades = await grade_repo.get_all()
    return _enrich(updated, _resolve_grade(updated.total_points, grades))


@router.post("/{astronaut_id}/photo", response_model=AstronautOut)
async def upload_astronaut_photo(
    astronaut_id: int,
    current: CurrentAstronaut,
    file: UploadFile = File(...),
    astronaut_repo: AstronautRepository = Depends(_astronaut_repo),
    grade_repo: GradeRepository = Depends(_grade_repo),
) -> AstronautOut:
    """Upload une photo de profil (multipart/form-data). JPEG, PNG ou WebP, max 5 Mo."""
    is_admin = "admin" in current.roles
    if current.id != astronaut_id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Format non supporté. Utilisez JPEG, PNG ou WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Fichier trop volumineux (max 5 Mo)",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = "jpg" if file.content_type == "image/jpeg" else file.content_type.split("/")[1]
    filename = f"avatar_{astronaut_id}_{int(time.time())}.{ext}"
    await asyncio.to_thread((UPLOAD_DIR / filename).write_bytes, contents)

    photo_url = f"/uploads/avatars/{filename}"
    target = await astronaut_repo.get_by_id(astronaut_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Astronaute introuvable")

    updated = await astronaut_repo.update_profile(target, {"photo_url": photo_url})
    logger.info(
        "photo_uploaded by=%s astronaut_id=%s filename=%s",
        current.email,
        astronaut_id,
        filename,
    )

    grades = await grade_repo.get_all()
    return _enrich(updated, _resolve_grade(updated.total_points, grades))


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

    old_roles = list(target.roles)
    new_roles = list(set(body.roles))
    updated = await astronaut_repo.update_roles(target, new_roles)

    logger.info(
        "roles_updated admin=%s target=%s old_roles=%s new_roles=%s",
        current_admin.email,
        updated.email,
        old_roles,
        new_roles,
    )

    grades = await grade_repo.get_all()
    return _enrich(updated, _resolve_grade(updated.total_points, grades))
