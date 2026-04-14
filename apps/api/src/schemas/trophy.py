from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class TrophyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    icon_url: str | None = None
    rule_type: str = Field(default="manual", pattern="^(manual|automatic)$")
    rule_config: str | None = None  # JSON brut
    season_id: int | None = None


class TrophyUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    icon_url: str | None = None
    rule_type: str | None = Field(None, pattern="^(manual|automatic)$")
    rule_config: str | None = None
    season_id: int | None = None


class TrophyOut(BaseModel):
    id: int
    name: str
    description: str | None
    icon_url: str | None
    rule_type: str
    rule_config: str | None
    season_id: int | None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Attribution ───────────────────────────────────────────────────────────────


class TrophyAttributionCreate(BaseModel):
    trophy_id: int
    astronaut_id: int | None = None
    planet_id: int | None = None
    comment: str | None = None

    @model_validator(mode="after")
    def validate_target(self) -> "TrophyAttributionCreate":
        has_astronaut = self.astronaut_id is not None
        has_planet = self.planet_id is not None
        if has_astronaut == has_planet:
            raise ValueError(
                "Exactement l'une des cibles doit être renseignée : astronaut_id OU planet_id."
            )
        return self


class TrophyAttributionOut(BaseModel):
    id: int
    trophy_id: int
    trophy_name: str | None = None
    trophy_icon_url: str | None = None
    astronaut_id: int | None
    planet_id: int | None
    season_id: int
    awarded_by: int
    comment: str | None
    awarded_at: datetime
    model_config = {"from_attributes": True}
