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


async def get_current_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> TokenPayload:
    """Extrait et valide le JWT depuis le header Authorization."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token manquant",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return verify_token(credentials.credentials)
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_astronaut(
    token: Annotated[TokenPayload, Depends(get_current_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Astronaut:
    """Charge l'astronaute depuis la BDD à partir du JWT."""
    repo = AstronautRepository(db)
    astronaut = await repo.get_by_id(token.astronaut_id)
    if astronaut is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Astronaute introuvable")
    return astronaut


async def require_admin(
    astronaut: Annotated[Astronaut, Depends(get_current_astronaut)],
) -> Astronaut:
    """Vérifie que l'astronaute a le rôle admin."""
    if "admin" not in astronaut.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès réservé aux admins")
    return astronaut


# Raccourcis typés pour les routes
CurrentAstronaut = Annotated[Astronaut, Depends(get_current_astronaut)]
CurrentAdmin = Annotated[Astronaut, Depends(require_admin)]
