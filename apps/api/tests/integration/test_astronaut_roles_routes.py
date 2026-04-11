"""Tests d'intégration pour PATCH /astronauts/{id}/roles (F-104)."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.deps import get_current_astronaut, require_admin
from src.core.security import create_access_token
from src.main import app


def make_astronaut(id: int, email: str, roles: list[str]) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.email = email
    a.roles = roles
    a.first_name = "Jean"
    a.last_name = "Dupont"
    a.photo_url = None
    a.hobbies = None
    a.client = None
    a.hire_date = None
    a.planet_id = None
    a.total_points = 100
    a.grade_name = None  # évite que MagicMock génère un objet non-string pour Pydantic
    a.created_at = "2026-01-01T00:00:00+00:00"
    a.updated_at = "2026-01-01T00:00:00+00:00"
    return a


@pytest.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def clear_overrides() -> None:
    yield
    app.dependency_overrides.clear()


def override_admin(admin: MagicMock) -> None:
    app.dependency_overrides[get_current_astronaut] = lambda: admin
    app.dependency_overrides[require_admin] = lambda: admin


async def test_patch_roles_promote_to_admin(client: AsyncClient) -> None:
    """Admin promeut un astronaute → 200, roles mis à jour."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])
    target = make_astronaut(2, "target@eleven-labs.com", ["astronaut"])

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=target)
    mock_repo.update_roles = AsyncMock(return_value=make_astronaut(2, "target@eleven-labs.com", ["astronaut", "admin"]))

    mock_grade_repo = MagicMock()
    mock_grade_repo.get_all = AsyncMock(return_value=[])

    override_admin(admin)
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/2/roles",
        json={"roles": ["astronaut", "admin"]},
    )

    assert response.status_code == 200
    mock_repo.update_roles.assert_called_once()


async def test_patch_roles_demote_other_admin(client: AsyncClient) -> None:
    """Admin rétrograde un autre admin → 200."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])
    target = make_astronaut(3, "other@eleven-labs.com", ["astronaut", "admin"])
    demoted = make_astronaut(3, "other@eleven-labs.com", ["astronaut"])

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=target)
    mock_repo.update_roles = AsyncMock(return_value=demoted)

    mock_grade_repo = MagicMock()
    mock_grade_repo.get_all = AsyncMock(return_value=[])

    override_admin(admin)
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/3/roles",
        json={"roles": ["astronaut"]},
    )

    assert response.status_code == 200


async def test_patch_roles_cannot_remove_own_admin(client: AsyncClient) -> None:
    """Un admin ne peut pas se retirer son propre rôle admin → 403."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])

    mock_repo = MagicMock()
    mock_grade_repo = MagicMock()

    override_admin(admin)
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/1/roles",
        json={"roles": ["astronaut"]},
    )

    assert response.status_code == 403
    assert "admin" in response.json()["detail"].lower()


async def test_patch_roles_target_not_found(client: AsyncClient) -> None:
    """Astronaute cible inexistant → 404."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=None)
    mock_grade_repo = MagicMock()

    override_admin(admin)
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/9999/roles",
        json={"roles": ["astronaut"]},
    )

    assert response.status_code == 404


async def test_patch_roles_non_admin_forbidden(client: AsyncClient) -> None:
    """Non-admin sur PATCH /roles → 403."""
    from fastapi import HTTPException

    app.dependency_overrides[get_current_astronaut] = lambda: make_astronaut(
        2, "user@eleven-labs.com", ["astronaut"]
    )
    app.dependency_overrides[require_admin] = lambda: (_ for _ in ()).throw(
        HTTPException(status_code=403, detail="Accès réservé aux admins")
    )

    response = await client.patch(
        "/api/v1/astronauts/3/roles",
        json={"roles": ["admin"]},
    )

    assert response.status_code == 403
