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


class AstronautCreate(BaseModel):
    """Création manuelle d'un astronaute par un admin."""

    email: str = Field(..., max_length=255)
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    planet_id: int | None = Field(default=None)
    hire_date: date | None = Field(default=None)


class AstronautSelfUpdate(BaseModel):
    """Champs modifiables par l'astronaute lui-même (ou un admin).
    Tous les champs sont optionnels : seuls les champs fournis sont mis à jour.
    """

    photo_url: str | None = Field(default=None, max_length=500)
    hobbies: str | None = Field(default=None, max_length=1000)
    client: str | None = Field(default=None, max_length=255)

    model_config = {"extra": "ignore"}

    @field_validator("photo_url")
    @classmethod
    def validate_photo_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("photo_url doit être une URL HTTP/HTTPS valide")
        return v


SELF_EDITABLE_FIELDS = {"photo_url", "hobbies", "client"}
ADMIN_ONLY_FIELDS = {"planet_id", "hire_date", "first_name", "last_name"}


class AstronautPatch(BaseModel):
    """Body unifié pour PATCH /astronauts/{id}.
    Champs self-edit : photo_url, hobbies, client.
    Champs admin uniquement : planet_id, hire_date, first_name, last_name.
    """

    photo_url: str | None = Field(default=None, max_length=500)
    hobbies: str | None = Field(default=None, max_length=1000)
    client: str | None = Field(default=None, max_length=255)
    planet_id: int | None = Field(default=None)
    hire_date: date | None = Field(default=None)
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)

    model_config = {"extra": "ignore"}

    @field_validator("photo_url")
    @classmethod
    def validate_photo_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("photo_url doit être une URL HTTP/HTTPS valide")
        return v


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
