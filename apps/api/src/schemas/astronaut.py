from datetime import date, datetime

from pydantic import BaseModel, Field


class AstronautOut(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    photo_url: str | None
    hobbies: str | None
    client: str | None
    hire_date: date | None
    planet_id: int | None
    roles: list[str]
    total_points: int
    grade_name: str | None = None  # calculé à la volée
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AstronautUpdate(BaseModel):
    photo_url: str | None = Field(None, max_length=500)
    hobbies: str | None = Field(None, max_length=1000)
    client: str | None = Field(None, max_length=255)
