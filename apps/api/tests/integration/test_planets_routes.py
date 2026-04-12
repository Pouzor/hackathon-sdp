"""Tests d'intégration pour les routes /planets."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token
from src.main import app


def make_planet(id: int = 1, name: str = "Mars") -> MagicMock:
    p = MagicMock()
    p.id = id
    p.name = name
    p.mantra = "Toujours de l'avant"
    p.blason_url = None
    p.color_hex = "#C1440E"
    p.is_competing = True
    p.is_default_for_newcomers = False
    return p


def admin_token() -> str:
    return create_access_token({
        "sub": "1",
        "email": "admin@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut", "admin"],
        "planet_id": 1,
    })


def user_token() -> str:
    return create_access_token({
        "sub": "2",
        "email": "user@eleven-labs.com",
        "astronaut_id": 2,
        "roles": ["astronaut"],
        "planet_id": 1,
    })


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


def mock_db_with_planet(planet: MagicMock | None = None) -> AsyncMock:
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [planet] if planet else []
    mock_result.scalar_one_or_none.return_value = planet
    mock_result.scalar.return_value = None

    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.delete = AsyncMock()
    return mock_db


async def test_list_planets_public(client: AsyncClient) -> None:
    """GET /planets est public (pas de token requis)."""
    from src.db.session import get_db
    mock_db = mock_db_with_planet(make_planet())
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/planets")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_planet_not_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    mock_db = mock_db_with_planet(None)
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/planets/999")
    app.dependency_overrides.clear()

    assert response.status_code == 404


async def test_create_planet_requires_admin(client: AsyncClient) -> None:
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    user_astronaut = MagicMock(spec=Astronaut)
    user_astronaut.id = 2
    user_astronaut.roles = ["astronaut"]

    app.dependency_overrides[get_current_astronaut] = lambda: user_astronaut

    response = await client.post(
        "/api/v1/planets",
        json={"name": "Nouvelle", "is_competing": True, "is_default_for_newcomers": False},
        headers={"Authorization": f"Bearer {user_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 403


async def test_create_planet_conflict_on_duplicate_name(client: AsyncClient) -> None:
    from src.db.session import get_db
    from src.models.astronaut import Astronaut

    existing_planet = make_planet(name="Mars")
    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    mock_db = mock_db_with_planet(existing_planet)

    async def override_get_db():
        yield mock_db

    from src.core.deps import get_current_astronaut
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.post(
        "/api/v1/planets",
        json={"name": "Mars", "is_competing": True, "is_default_for_newcomers": False},
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 409


async def test_delete_planet_not_found(client: AsyncClient) -> None:
    from src.core.deps import get_current_astronaut
    from src.db.session import get_db
    from src.models.astronaut import Astronaut

    mock_db = mock_db_with_planet(None)
    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.delete(
        "/api/v1/planets/999",
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404
