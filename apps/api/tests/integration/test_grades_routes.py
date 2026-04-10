"""Tests d'intégration pour les routes /grades."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.security import create_access_token
from src.main import app


def make_grade(id: int = 1) -> MagicMock:
    g = MagicMock()
    g.id = id
    g.name = "Rookie"
    g.threshold_points = 0
    g.order = 1
    return g


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


def mock_db_with_grade(grade: MagicMock | None = None) -> AsyncMock:
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [grade] if grade else []
    mock_result.scalar_one_or_none.return_value = grade
    mock_db = AsyncMock()
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.delete = AsyncMock()
    return mock_db


async def test_list_grades_public(client: AsyncClient) -> None:
    from src.db.session import get_db
    mock_db = mock_db_with_grade(make_grade())
    app.dependency_overrides[get_db] = lambda: (yield mock_db)

    response = await client.get("/api/v1/grades")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_create_grade_requires_admin(client: AsyncClient) -> None:
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    user_astronaut = MagicMock(spec=Astronaut)
    user_astronaut.id = 2
    user_astronaut.roles = ["astronaut"]

    app.dependency_overrides[get_current_astronaut] = lambda: user_astronaut

    response = await client.post(
        "/api/v1/grades",
        json={"name": "Legend", "threshold_points": 50000, "order": 20},
        headers={"Authorization": f"Bearer {user_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 403


async def test_create_grade_as_admin(client: AsyncClient) -> None:
    from unittest.mock import patch
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut
    from src.repositories.grade import GradeRepository

    new_grade = make_grade(id=15)
    new_grade.name = "Legend"
    new_grade.threshold_points = 50000
    new_grade.order = 20

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    with patch.object(GradeRepository, "create", new=AsyncMock(return_value=new_grade)):
        response = await client.post(
            "/api/v1/grades",
            json={"name": "Legend", "threshold_points": 50000, "order": 20},
            headers={"Authorization": f"Bearer {admin_token()}"},
        )
    app.dependency_overrides.clear()

    assert response.status_code == 201


async def test_update_grade_not_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    mock_db = mock_db_with_grade(None)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.patch(
        "/api/v1/grades/999",
        json={"name": "Updated"},
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404


async def test_delete_grade_not_found(client: AsyncClient) -> None:
    from src.db.session import get_db
    from src.core.deps import get_current_astronaut
    from src.models.astronaut import Astronaut

    mock_db = mock_db_with_grade(None)

    admin_astronaut = MagicMock(spec=Astronaut)
    admin_astronaut.id = 1
    admin_astronaut.roles = ["astronaut", "admin"]

    app.dependency_overrides[get_db] = lambda: (yield mock_db)
    app.dependency_overrides[get_current_astronaut] = lambda: admin_astronaut

    response = await client.delete(
        "/api/v1/grades/999",
        headers={"Authorization": f"Bearer {admin_token()}"},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404
