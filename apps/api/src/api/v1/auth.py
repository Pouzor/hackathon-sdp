import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

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


@router.get("/google/callback")
async def google_callback(
    code: str = Query(..., description="Code OAuth retourné par Google"),
    state: str = Query(..., description="State anti-CSRF"),
    service: AuthService = Depends(_get_auth_service),
) -> TokenResponse:
    """
    Callback Google OAuth.
    - Échange le code contre les infos utilisateur
    - Vérifie le domaine @eleven-labs.com
    - Crée l'astronaute si première connexion
    - Retourne un JWT
    """
    user_info = await service.exchange_code_for_user_info(code)
    service.verify_allowed_domain(user_info)
    astronaut = await service.get_or_create_astronaut(user_info)
    token = service.create_jwt(astronaut)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=AstronautMe)
async def get_me(current: CurrentAstronaut) -> AstronautMe:
    """Retourne le profil de l'astronaute connecté."""
    return AstronautMe.model_validate(current)
