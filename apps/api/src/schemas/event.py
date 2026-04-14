from datetime import date, datetime

from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    event_date: date


class EventOut(BaseModel):
    id: int
    name: str
    event_date: date
    created_by: int | None
    created_at: datetime
    attendance_count: int = 0

    model_config = {"from_attributes": True}


class AttendanceCreate(BaseModel):
    astronaut_ids: list[int] = Field(..., min_length=1)
    points: int = Field(default=0, ge=0)
    comment: str | None = None


class AttendanceResult(BaseModel):
    event_id: int
    recorded: int           # présences enregistrées (nouvelles)
    already_present: int    # déjà enregistrées (skip)
    attributions_created: int  # PointAttributions créées (si points > 0)
