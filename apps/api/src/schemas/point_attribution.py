from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class PointAttributionCreate(BaseModel):
    astronaut_ids: list[int] = Field(..., min_length=1)
    activity_id: int
    points: int | None = Field(None, gt=0)  # None = utiliser base_points de l'activité
    comment: str | None = None

    @model_validator(mode="after")
    def validate_single_astronaut_for_non_collaborative(self) -> "PointAttributionCreate":
        # La validation de allow_multiple_assignees se fait dans le service
        # (besoin de l'activité depuis la BDD)
        return self


class PointAttributionDeleteRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)


class PointAttributionOut(BaseModel):
    id: int
    astronaut_id: int
    planet_id: int
    activity_id: int
    season_id: int
    awarded_by: int
    points: int
    comment: str | None
    first_ever_multiplier_applied: bool
    first_season_bonus_applied: bool
    awarded_at: datetime
    # enrichi à la volée
    activity_name: str | None = None
    astronaut_first_name: str | None = None
    astronaut_last_name: str | None = None
    model_config = {"from_attributes": True}
