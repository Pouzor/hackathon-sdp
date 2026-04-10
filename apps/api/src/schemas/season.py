from datetime import date, datetime

from pydantic import BaseModel, Field


class SeasonCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    start_date: date


class SeasonOut(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date | None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}
