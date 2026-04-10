"""Tests d'intégration pour les routes d'authentification."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token
from src.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


async def test_google_login_redirects(client: AsyncClient) -> None:
    """GET /auth/google doit rediriger vers Google."""
    with patch("src.api.v1.auth._get_auth_service") as mock_factory:
        mock_service = MagicMock()
        mock_service.build_google_auth_url.return_value = "https://accounts.google.com/o/oauth2/v2/auth?test=1"
        mock_factory.return_value = mock_service

        response = await client.get("/api/v1/auth/google", follow_redirects=False)
        assert response.status_code in (302, 307)
        assert "accounts.google.com" in response.headers.get("location", "")


async def test_me_without_token_returns_401(client: AsyncClient) -> None:
    """GET /auth/me sans token → 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_me_with_valid_token(client: AsyncClient) -> None:
    """GET /auth/me avec token valide et astronaute mocké → 200."""
    from src.db.session import get_db
    from src.models.astronaut import Astronaut

    token = create_access_token({
        "sub": "1",
        "email": "jean@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut"],
        "planet_id": None,
    })

    mock_astronaut = Astronaut(
        id=1,
        email="jean@eleven-labs.com",
        first_name="Jean",
        last_name="Dupont",
        photo_url=None,
        roles=["astronaut"],
        planet_id=None,
        total_points=0,
    )

    async def override_db():
        mock_db = AsyncMock()
        mock_db.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=mock_astronaut)))
        yield mock_db

    app.dependency_overrides[get_db] = override_db

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "jean@eleven-labs.com"
    assert data["roles"] == ["astronaut"]
