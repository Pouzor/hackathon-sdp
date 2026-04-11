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


ALLOWED_ROLES = {"astronaut", "admin"}


class AstronautRoleUpdate(BaseModel):
    roles: list[str] = Field(..., min_length=1)

    @classmethod
    def __get_validators__(cls):  # type: ignore[override]
        yield cls.validate

    @classmethod
    def validate_roles(cls, v: list[str]) -> list[str]:
        unknown = set(v) - ALLOWED_ROLES
        if unknown:
            raise ValueError(f"Rôles inconnus : {unknown}. Autorisés : {ALLOWED_ROLES}")
        if not v:
            raise ValueError("La liste de rôles ne peut pas être vide")
        return list(set(v))  # dédupliquer
