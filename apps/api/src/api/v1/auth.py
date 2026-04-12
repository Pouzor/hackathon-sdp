from typing import Union

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.deps import CurrentAstronaut
from src.core.security import generate_oauth_state, verify_oauth_state
from src.db.session import get_db
from src.repositories.astronaut import AstronautRepository
from src.schemas.auth import AstronautMe, TokenResponse
from src.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

_ALLOWED_ORIGINS = {"frontend", "backoffice"}


def _get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(AstronautRepository(db))


@router.get("/google")
async def google_login(
    origin: str = Query(default="frontend", description="'frontend' ou 'backoffice'"),
    service: AuthService = Depends(_get_auth_service),
) -> RedirectResponse:
    """Redirige vers Google OAuth. Origin encodé et signé (HMAC) dans le state CSRF."""
    if origin not in _ALLOWED_ORIGINS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Origin invalide")
    state = generate_oauth_state(origin)
    url = service.build_google_auth_url(state=state)
    return RedirectResponse(url=url)


@router.get("/google/callback", response_model=None)
async def google_callback(
    code: str = Query(..., description="Code OAuth retourné par Google"),
    state: str = Query(..., description="State CSRF signé (HMAC)"),
    accept: str = Header(default="text/html"),
    service: AuthService = Depends(_get_auth_service),
) -> Union[RedirectResponse, TokenResponse]:
    """
    Callback Google OAuth.
    - Vérifie la signature CSRF du state
    - Échange le code contre les infos utilisateur
    - Vérifie le domaine @eleven-labs.com
    - Crée l'astronaute si première connexion
    - Redirige vers frontend ou backoffice avec le JWT
    Note: le JWT est transmis en query param (?token=) — trade-off accepté pour ce flow
    de dev (CLAUDE.md §5). Migration vers httpOnly cookie prévue.
    """
    try:
        origin = verify_oauth_state(state)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="State CSRF invalide")

    user_info = await service.exchange_code_for_user_info(code)
    service.verify_allowed_domain(user_info)
    astronaut = await service.get_or_create_astronaut(user_info)
    token = service.create_jwt(astronaut)

    if "application/json" in accept:
        return TokenResponse(access_token=token)

    base_url = settings.backoffice_url if origin == "backoffice" else settings.frontend_url
    response = RedirectResponse(url=f"{base_url}/auth/callback?token={token}", status_code=307)
    # Prevent token leakage via Referer header (token is in query param — CLAUDE.md §5)
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@router.get("/me", response_model=AstronautMe)
async def get_me(current: CurrentAstronaut) -> AstronautMe:
    """Retourne le profil de l'astronaute connecté."""
    return AstronautMe.model_validate(current)
