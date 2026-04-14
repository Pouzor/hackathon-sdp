import json
from typing import Any

from pydantic import field_validator, model_validator
from pydantic.fields import FieldInfo
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict
from pydantic_settings.sources.providers.env import EnvSettingsSource


class _TolerantEnvSource(EnvSettingsSource):
    """EnvSettingsSource that silently passes complex fields through as raw strings
    instead of raising SettingsError when json.loads fails.
    The model_validator on Settings then converts them to the right type."""

    def prepare_field_value(
        self,
        field_name: str,
        field: FieldInfo,
        value: Any,
        value_is_complex: bool,
    ) -> Any:
        if value_is_complex and isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith(("[", "{")):
                try:
                    return json.loads(stripped)
                except json.JSONDecodeError:
                    pass
            # Return as-is; model_validator will handle comma-separated fallback
            return stripped
        return value


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

    # CORS — accepts JSON array OR comma-separated: "http://a,http://b"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]

    # Frontend URL (pour les redirections post-login)
    frontend_url: str = "http://localhost:5173"
    backoffice_url: str = "http://localhost:5174"

    # Uploads
    upload_dir: str = "uploads"

    @model_validator(mode="before")
    @classmethod
    def coerce_list_fields(cls, values: dict[str, Any]) -> dict[str, Any]:
        """Convert comma-separated strings to lists before field validation."""
        co = values.get("cors_origins")
        if isinstance(co, str):
            stripped = co.strip()
            if stripped.startswith("["):
                values["cors_origins"] = json.loads(stripped)
            else:
                values["cors_origins"] = [v.strip() for v in stripped.split(",") if v.strip()]
        return values

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        *args: PydanticBaseSettingsSource,
        **kwargs: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        remaining = tuple(args) + tuple(kwargs.values())
        return (init_settings, _TolerantEnvSource(settings_cls), dotenv_settings) + remaining


settings = Settings()  # type: ignore[call-arg]  # pydantic-settings populates required fields from env
