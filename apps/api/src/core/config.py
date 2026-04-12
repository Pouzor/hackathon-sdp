from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    app_name: str = "Site des Planètes API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/planets"

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        weak = {"change-me-in-production", "secret", "changeme", ""}
        if not v or v in weak or len(v) < 32:
            raise ValueError(
                "SECRET_KEY must be set to a secure random value of at least 32 characters"
            )
        return v

    # Google OAuth — toutes les valeurs viennent du .env
    google_client_id: str = ""
    google_client_secret: str = ""

    @field_validator("google_client_id", "google_client_secret")
    @classmethod
    def validate_oauth_credentials(cls, v: str) -> str:
        if not v:
            raise ValueError("Google OAuth credentials (client_id / client_secret) must be set")
        return v
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    google_auth_url: str = "https://accounts.google.com/o/oauth2/v2/auth"
    google_token_url: str = "https://oauth2.googleapis.com/token"
    google_userinfo_url: str = "https://www.googleapis.com/oauth2/v3/userinfo"

    # Domaine autorisé
    allowed_domain: str = "eleven-labs.com"

    # CORS — frontend (5173) + backoffice (5174)
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]

    # Frontend URL (pour les redirections post-login)
    frontend_url: str = "http://localhost:5173"
    backoffice_url: str = "http://localhost:5174"


settings = Settings()  # type: ignore[call-arg]  # pydantic-settings populates required fields from env
