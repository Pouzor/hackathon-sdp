"""Tests unitaires pour AuthService — règles métier critiques."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from src.schemas.auth import GoogleUserInfo
from src.services.auth import AuthService


def make_service() -> AuthService:
    repo = MagicMock()
    return AuthService(repo)


def make_user_info(**kwargs: object) -> GoogleUserInfo:
    defaults = {
        "sub": "google-123",
        "email": "dupont@eleven-labs.com",
        "email_verified": True,
        "given_name": "Jean",
        "family_name": "Dupont",
        "picture": "https://photo.example.com/img.jpg",
        "hd": "eleven-labs.com",
    }
    defaults.update(kwargs)
    return GoogleUserInfo.model_validate(defaults)


# ─── Domaine autorisé ───────────────────────────────────────────────────────

def test_verify_allowed_domain_ok() -> None:
    service = make_service()
    user_info = make_user_info(hd="eleven-labs.com")
    service.verify_allowed_domain(user_info)  # ne lève pas


def test_verify_allowed_domain_blocked_external_hd() -> None:
    service = make_service()
    user_info = make_user_info(email="hacker@gmail.com", hd="gmail.com")
    with pytest.raises(HTTPException) as exc_info:
        service.verify_allowed_domain(user_info)
    assert exc_info.value.status_code == 403


def test_verify_allowed_domain_blocked_no_hd() -> None:
    """Email @eleven-labs.com mais sans hd claim (compte perso Google)."""
    service = make_service()
    user_info = make_user_info(hd=None)
    # L'email est @eleven-labs.com → doit passer (fallback sur le domaine de l'email)
    service.verify_allowed_domain(user_info)


def test_verify_allowed_domain_blocked_wrong_email_no_hd() -> None:
    service = make_service()
    user_info = make_user_info(email="hacker@gmail.com", hd=None)
    with pytest.raises(HTTPException) as exc_info:
        service.verify_allowed_domain(user_info)
    assert exc_info.value.status_code == 403


# ─── Création astronaute ────────────────────────────────────────────────────

async def test_get_or_create_returns_existing() -> None:
    repo = MagicMock()
    existing = MagicMock(id=5, email="dupont@eleven-labs.com")
    repo.get_by_email = AsyncMock(return_value=existing)
    service = AuthService(repo)

    user_info = make_user_info()
    result = await service.get_or_create_astronaut(user_info)

    assert result is existing
    repo.create.assert_not_called()


async def test_get_or_create_creates_on_first_login() -> None:
    repo = MagicMock()
    repo.get_by_email = AsyncMock(return_value=None)
    new_astronaut = MagicMock(id=1, email="dupont@eleven-labs.com")
    repo.create = AsyncMock(return_value=new_astronaut)
    service = AuthService(repo)

    user_info = make_user_info()
    result = await service.get_or_create_astronaut(user_info)

    assert result is new_astronaut
    repo.create.assert_called_once_with(
        email="dupont@eleven-labs.com",
        first_name="Jean",
        last_name="Dupont",
        photo_url="https://photo.example.com/img.jpg",
    )


# ─── Création JWT ───────────────────────────────────────────────────────────

def test_create_jwt_contains_expected_claims() -> None:
    from src.core.security import decode_access_token

    repo = MagicMock()
    service = AuthService(repo)
    astronaut = MagicMock(
        id=42,
        email="dupont@eleven-labs.com",
        roles=["astronaut"],
        planet_id=2,
    )
    token = service.create_jwt(astronaut)
    decoded = decode_access_token(token)

    assert decoded["astronaut_id"] == 42
    assert decoded["email"] == "dupont@eleven-labs.com"
    assert decoded["roles"] == ["astronaut"]
    assert decoded["planet_id"] == 2


# ─── URL Google ─────────────────────────────────────────────────────────────

def test_build_google_auth_url_contains_client_id() -> None:
    with patch("src.services.auth.settings") as mock_settings:
        mock_settings.google_client_id = "test-client-id"
        mock_settings.google_redirect_uri = "http://localhost:8000/callback"
        mock_settings.google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        mock_settings.allowed_domain = "eleven-labs.com"

        repo = MagicMock()
        service = AuthService(repo)
        url = service.build_google_auth_url(state="test-state")

    assert "test-client-id" in url
    assert "eleven-labs.com" in url
    assert "test-state" in url
