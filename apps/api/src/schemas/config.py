from pydantic import BaseModel, Field


class SeniorityConfigOut(BaseModel):
    id: int
    points_per_year: int

    model_config = {"from_attributes": True}


class SeniorityConfigUpdate(BaseModel):
    points_per_year: int = Field(..., ge=0)
