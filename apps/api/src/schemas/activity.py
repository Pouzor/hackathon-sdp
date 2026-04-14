from pydantic import BaseModel, Field


class ActivityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    base_points: int = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    is_collaborative: bool = False
    allow_multiple_assignees: bool = False


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    base_points: int | None = Field(None, gt=0)
    category: str | None = None
    is_collaborative: bool | None = None
    allow_multiple_assignees: bool | None = None
    is_active: bool | None = None


class ActivityOut(ActivityBase):
    id: int
    is_active: bool
    # base_points peut être 0 pour les activités système (ex: présence événement)
    base_points: int = Field(..., ge=0)
    model_config = {"from_attributes": True}
