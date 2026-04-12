"""Tests d'intégration pour les routes /activities."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token
from src.main import app


def make_activity(id: int = 1) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.name = "Article de blog"
    a.base_points = 40
    a.category = "intelligence_collective"
    a.is_collaborative = False
    a.allow_multiple_assignees = False
    a.is_active = True
    return a


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


def mock_db_with_activity(activity: MagicMock | None = None) -> AsyncMock:
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [activity] if activity else []
    mock_result.scalar_one_or_none.return_value = activity
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    return mock_db


async def test_list_activities_public(client: AsyncClient) -> None:
    from src.db.session import get_db
    mock_db = mock_db_with_activity(make_activity())
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/activities")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_activity_not_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    mock_db = mock_db_with_activity(None)
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/activities/999")
    app.dependency_overrides.clear()

    assert response.status_code == 404


async def test_get_activity_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    mock_db = mock_db_with_activity(make_activity())
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/activities/1")
    app.dependency_overrides.clear()

    assert response.status_code == 200


async def test_create_activity_requires_admin(client: AsyncClient) -> None:
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    user_astronaut = MagicMock(spec=Astronaut)
    user_astronaut.id = 2
    user_astronaut.roles = ["astronaut"]

    app.dependency_overrides[get_current_astronaut] = lambda: user_astronaut

    response = await client.post(
        "/api/v1/activities",
        json={"name": "Nouvelle", "base_points": 50, "category": "talk", "is_collaborative": False, "allow_multiple_assignees": False},
        headers={"Authorization": f"Bearer {user_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 403


async def test_create_activity_as_admin(client: AsyncClient) -> None:
    from unittest.mock import patch

    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut
    from src.repositories.activity import ActivityRepository

    new_activity = make_activity(id=2)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    with patch.object(ActivityRepository, "create", new=AsyncMock(return_value=new_activity)):
        response = await client.post(
            "/api/v1/activities",
            json={"name": "Nouveau Talk", "base_points": 60, "category": "talk", "is_collaborative": False, "allow_multiple_assignees": False},
            headers={"Authorization": f"Bearer {admin_token()}"},
        )
    app.dependency_overrides.clear()

    assert response.status_code == 201


async def test_update_activity_not_found(client: AsyncClient) -> None:
    from src.core.deps import get_current_astronaut
    from src.db.session import get_db
    from src.models.astronaut import Astronaut

    mock_db = mock_db_with_activity(None)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.patch(
        "/api/v1/activities/999",
        json={"name": "Updated"},
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404
