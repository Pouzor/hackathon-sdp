import httpx
from fastapi import HTTPException, status

from src.core.config import settings
from src.core.security import create_access_token
from src.models.astronaut import Astronaut
from src.repositories.astronaut import AstronautRepository
from src.schemas.auth import GoogleUserInfo


class AuthService:
    def __init__(self, repo: AstronautRepository) -> None:
        self._repo = repo

    def build_google_auth_url(self, state: str) -> str:
        """Construit l'URL de redirection vers Google OAuth."""
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "state": state,
            "hd": settings.allowed_domain,  # Pré-filtre côté Google
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{settings.google_auth_url}?{query}"

    async def exchange_code_for_user_info(self, code: str) -> GoogleUserInfo:
        """Échange le code OAuth contre les infos utilisateur Google."""
        async with httpx.AsyncClient() as client:
            # 1. Échanger le code contre un access_token
            token_response = await client.post(
                settings.google_token_url,
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Échec de l'échange du code OAuth",
                )
            token_data = token_response.json()
            access_token = token_data.get("access_token")

            # 2. Récupérer les infos utilisateur
            userinfo_response = await client.get(
                settings.google_userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if userinfo_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Impossible de récupérer les informations utilisateur",
                )

        return GoogleUserInfo.model_validate(userinfo_response.json())

    def verify_allowed_domain(self, user_info: GoogleUserInfo) -> None:
        """Vérifie que l'email appartient au domaine autorisé."""
        hd = user_info.hd
        email_domain = user_info.email.split("@")[-1]
        if hd != settings.allowed_domain and email_domain != settings.allowed_domain:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès réservé aux comptes @{settings.allowed_domain}",
            )

    async def get_or_create_astronaut(self, user_info: GoogleUserInfo) -> Astronaut:
        """Récupère l'astronaute existant ou le crée à la première connexion."""
        astronaut = await self._repo.get_by_email(user_info.email)
        if astronaut is None:
            astronaut = await self._repo.create(
                email=user_info.email,
                first_name=user_info.given_name,
                last_name=user_info.family_name,
                photo_url=user_info.picture,
            )
        return astronaut

    def create_jwt(self, astronaut: Astronaut) -> str:
        """Crée un JWT avec les claims de l'astronaute."""
        return create_access_token({
            "sub": str(astronaut.id),
            "email": astronaut.email,
            "astronaut_id": astronaut.id,
            "roles": astronaut.roles,
            "planet_id": astronaut.planet_id,
        })
