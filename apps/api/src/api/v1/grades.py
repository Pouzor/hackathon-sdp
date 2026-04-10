from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.repositories.grade import GradeRepository
from src.schemas.grade import GradeCreate, GradeOut, GradeUpdate

router = APIRouter(prefix="/grades", tags=["grades"])


def _repo(db: AsyncSession = Depends(get_db)) -> GradeRepository:
    return GradeRepository(db)


@router.get("", response_model=list[GradeOut])
async def list_grades(repo: GradeRepository = Depends(_repo)) -> list[GradeOut]:
    grades = await repo.get_all()
    return [GradeOut.model_validate(g) for g in grades]


@router.post("", response_model=GradeOut, status_code=status.HTTP_201_CREATED)
async def create_grade(
    body: GradeCreate,
    _admin: CurrentAdmin,
    repo: GradeRepository = Depends(_repo),
) -> GradeOut:
    grade = await repo.create(**body.model_dump())
    return GradeOut.model_validate(grade)


@router.patch("/{grade_id}", response_model=GradeOut)
async def update_grade(
    grade_id: int,
    body: GradeUpdate,
    _admin: CurrentAdmin,
    repo: GradeRepository = Depends(_repo),
) -> GradeOut:
    grade = await repo.get_by_id(grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade introuvable")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    grade = await repo.update(grade, **updates)
    return GradeOut.model_validate(grade)


@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_grade(
    grade_id: int,
    _admin: CurrentAdmin,
    repo: GradeRepository = Depends(_repo),
) -> None:
    grade = await repo.get_by_id(grade_id)
    if grade is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade introuvable")
    await repo.delete(grade)
