from pydantic import BaseModel


class GoogleUserInfo(BaseModel):
    sub: str
    email: str
    email_verified: bool
    given_name: str
    family_name: str
    picture: str | None = None
    hd: str | None = None  # Hosted domain (Google Workspace)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AstronautMe(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    photo_url: str | None
    roles: list[str]
    planet_id: int | None
    total_points: int

    model_config = {"from_attributes": True}
