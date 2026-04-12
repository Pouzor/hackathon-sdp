import hashlib
import hmac
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


# --- CSRF state helpers ---

def _hmac_sign(message: str) -> str:
    """Signe un message avec HMAC-SHA256 et la clé secrète."""
    return hmac.new(settings.secret_key.encode(), message.encode(), hashlib.sha256).hexdigest()


def generate_oauth_state(origin: str) -> str:
    """Génère un state CSRF signé : '{nonce}:{origin}:{hmac}'."""
    import secrets as _secrets
    nonce = _secrets.token_urlsafe(24)
    payload = f"{nonce}:{origin}"
    sig = _hmac_sign(payload)
    return f"{payload}:{sig}"


def verify_oauth_state(state: str) -> str:
    """Vérifie la signature CSRF et retourne l'origin. Lève ValueError si invalide."""
    parts = state.rsplit(":", 1)
    if len(parts) != 2:
        raise ValueError("State malformé")
    payload, sig = parts
    expected = _hmac_sign(payload)
    if not hmac.compare_digest(expected, sig):
        raise ValueError("Signature CSRF invalide")
    # payload = "{nonce}:{origin}"
    origin_parts = payload.split(":", 1)
    return origin_parts[-1] if len(origin_parts) == 2 else "frontend"
