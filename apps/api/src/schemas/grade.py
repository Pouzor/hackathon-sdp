from pydantic import BaseModel, Field


class GradeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    threshold_points: int = Field(..., ge=0)
    order: int = Field(..., gt=0)


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    threshold_points: int | None = Field(None, ge=0)
    order: int | None = Field(None, gt=0)


class GradeOut(GradeBase):
    id: int
    model_config = {"from_attributes": True}
