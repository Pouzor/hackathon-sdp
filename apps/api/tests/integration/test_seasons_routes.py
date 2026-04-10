"""Tests d'intégration pour les routes /seasons."""
from datetime import date
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token
from src.main import app


def admin_token() -> str:
    return create_access_token({
        "sub": "1",
        "email": "admin@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut", "admin"],
        "planet_id": 1,
    })


def make_season(id: int = 1, is_active: bool = True) -> MagicMock:
    s = MagicMock()
    s.id = id
    s.name = "Saison 2026"
    s.start_date = date(2026, 1, 1)
    s.end_date = None
    s.is_active = is_active
    s.created_at = MagicMock()
    s.created_at.isoformat.return_value = "2026-01-01T00:00:00+00:00"
    return s


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


async def test_list_seasons_public(client: AsyncClient) -> None:
    from src.db.session import get_db

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [make_season()]
    mock_result.scalar_one_or_none.return_value = make_season()
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    response = await client.get("/api/v1/seasons")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_active_season_none(client: AsyncClient) -> None:
    from src.db.session import get_db

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    response = await client.get("/api/v1/seasons/active")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() is None


async def test_activate_season_not_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.post(
        "/api/v1/seasons/999/activate",
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404


async def test_close_season_requires_active(client: AsyncClient) -> None:
    from src.db.session import get_db
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    inactive_season = make_season(is_active=False)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = inactive_season
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.post(
        "/api/v1/seasons/1/close",
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 400
