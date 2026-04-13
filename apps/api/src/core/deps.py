import time
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import TokenPayload, verify_token
from src.db.session import get_db
from src.models.astronaut import Astronaut
from src.repositories.astronaut import AstronautRepository

bearer_scheme = HTTPBearer(auto_error=False)

# Simple TTL cache to avoid a DB round-trip on every authenticated request.
# Keyed by (astronaut_id, token_exp) so entries are invalidated when the token rotates.
# TTL capped at 60 s so role/planet changes propagate within a minute.
_AUTH_CACHE_TTL = 60.0
_astronaut_cache: dict[tuple[int, int], tuple[Astronaut, float]] = {}


async def get_current_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> TokenPayload:
    """Extrait et valide le JWT depuis le header Authorization."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return verify_token(credentials.credentials)
    except (JWTError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_astronaut(
    token: Annotated[TokenPayload, Depends(get_current_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Astronaut:
    """Charge l'astronaute depuis la BDD à partir du JWT (avec cache TTL court)."""
    now = time.monotonic()
    cache_key = (token.astronaut_id, token.exp if token.exp is not None else 0)
    cached = _astronaut_cache.get(cache_key)
    if cached is not None:
        astronaut, expires_at = cached
        if now < expires_at:
            return astronaut

    repo = AstronautRepository(db)
    result = await repo.get_by_id(token.astronaut_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
        )
    _astronaut_cache[cache_key] = (result, now + _AUTH_CACHE_TTL)
    return result


async def require_admin(
    astronaut: Annotated[Astronaut, Depends(get_current_astronaut)],
) -> Astronaut:
    """Vérifie que l'astronaute a le rôle admin."""
    if "admin" not in astronaut.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Accès réservé aux admins"
        )
    return astronaut


# Raccourcis typés pour les routes
CurrentAstronaut = Annotated[Astronaut, Depends(get_current_astronaut)]
CurrentAdmin = Annotated[Astronaut, Depends(require_admin)]
