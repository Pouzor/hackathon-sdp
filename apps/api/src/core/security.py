from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from src.core.config import settings


def create_access_token(data: dict[str, Any]) -> str:
    """Crée un JWT signé avec expiration."""
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload["exp"] = expire
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Décode et valide un JWT. Lève JWTError si invalide ou expiré."""
    return dict(jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm]))


class TokenPayload:
    """Claims attendus dans le JWT."""

    def __init__(self, data: dict[str, Any]) -> None:
        self.sub: str = str(data["sub"])
        self.email: str = str(data["email"])
        self.astronaut_id: int = int(data["astronaut_id"])
        self.roles: list[str] = list(data.get("roles", ["astronaut"]))
        self.planet_id: int | None = data.get("planet_id")

    @property
    def is_admin(self) -> bool:
        return "admin" in self.roles


def verify_token(token: str) -> TokenPayload:
    """Vérifie le JWT et retourne le payload typé. Lève JWTError si invalide."""
    data = decode_access_token(token)
    return TokenPayload(data)
