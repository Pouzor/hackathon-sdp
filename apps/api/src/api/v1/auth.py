import secrets
from typing import Union

from fastapi import APIRouter, Depends, Header, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.deps import CurrentAstronaut
from src.db.session import get_db
from src.repositories.astronaut import AstronautRepository
from src.schemas.auth import AstronautMe, TokenResponse
from src.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(AstronautRepository(db))


@router.get("/google")
async def google_login(
    service: AuthService = Depends(_get_auth_service),
) -> RedirectResponse:
    """Redirige vers la page de connexion Google OAuth."""
    state = secrets.token_urlsafe(32)
    url = service.build_google_auth_url(state=state)
    return RedirectResponse(url=url)


@router.get("/google/callback", response_model=None)
async def google_callback(
    code: str = Query(..., description="Code OAuth retourné par Google"),
    state: str = Query(..., description="State anti-CSRF"),
    accept: str = Header(default="text/html"),
    service: AuthService = Depends(_get_auth_service),
) -> Union[RedirectResponse, TokenResponse]:
    """
    Callback Google OAuth.
    - Échange le code contre les infos utilisateur
    - Vérifie le domaine @eleven-labs.com
    - Crée l'astronaute si première connexion
    - Redirige vers le frontend avec le JWT (ou retourne JSON si Accept: application/json)
    """
    user_info = await service.exchange_code_for_user_info(code)
    service.verify_allowed_domain(user_info)
    astronaut = await service.get_or_create_astronaut(user_info)
    token = service.create_jwt(astronaut)

    if "application/json" in accept:
        return TokenResponse(access_token=token)

    frontend_callback = f"{settings.frontend_url}/auth/callback?token={token}"
    return RedirectResponse(url=frontend_callback, status_code=307)


@router.get("/me", response_model=AstronautMe)
async def get_me(current: CurrentAstronaut) -> AstronautMe:
    """Retourne le profil de l'astronaute connecté."""
    return AstronautMe.model_validate(current)
