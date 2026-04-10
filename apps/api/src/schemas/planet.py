from pydantic import BaseModel, Field


class PlanetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    mantra: str | None = None
    blason_url: str | None = None
    color_hex: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_competing: bool = True
    is_default_for_newcomers: bool = False


class PlanetCreate(PlanetBase):
    pass


class PlanetUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    mantra: str | None = None
    blason_url: str | None = None
    color_hex: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_competing: bool | None = None
    is_default_for_newcomers: bool | None = None


class PlanetOut(PlanetBase):
    id: int
    model_config = {"from_attributes": True}
