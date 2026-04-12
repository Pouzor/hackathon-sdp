from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


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


class AstronautSelfUpdate(BaseModel):
    """Champs modifiables par l'astronaute lui-même (ou un admin).
    Tous les champs sont optionnels : seuls les champs fournis sont mis à jour.
    """

    photo_url: str | None = Field(default=None, max_length=500)
    hobbies: str | None = Field(default=None, max_length=1000)
    client: str | None = Field(default=None, max_length=255)

    model_config = {"extra": "ignore"}


ALLOWED_ROLES = {"astronaut", "admin"}


class AstronautRoleUpdate(BaseModel):
    roles: list[str] = Field(..., min_length=1)

    @field_validator("roles")
    @classmethod
    def validate_roles(cls, v: list[str]) -> list[str]:
        unknown = set(v) - ALLOWED_ROLES
        if unknown:
            raise ValueError(f"Rôles inconnus : {unknown}. Autorisés : {ALLOWED_ROLES}")
        return list(set(v))  # dédupliquer
