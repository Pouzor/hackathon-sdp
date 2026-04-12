"""Tests d'intégration pour PATCH /astronauts/{id} (F-202)."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.deps import get_current_astronaut, require_admin
from src.main import app


def make_astronaut(id: int, email: str, roles: list[str], **kwargs: object) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.email = email
    a.roles = roles
    a.first_name = kwargs.get("first_name", "Jean")
    a.last_name = kwargs.get("last_name", "Dupont")
    a.photo_url = kwargs.get("photo_url", None)
    a.hobbies = kwargs.get("hobbies", None)
    a.client = kwargs.get("client", None)
    a.hire_date = None
    a.planet_id = None
    a.total_points = 100
    a.grade_name = None
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


async def test_patch_profile_self_update(client: AsyncClient) -> None:
    """Astronaute peut modifier son propre profil → 200."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    user = make_astronaut(2, "user@eleven-labs.com", ["astronaut"])
    updated = make_astronaut(2, "user@eleven-labs.com", ["astronaut"], hobbies="music", client="Acme")

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=user)
    mock_repo.update_profile = AsyncMock(return_value=updated)

    mock_grade_repo = MagicMock()
    mock_grade_repo.get_all = AsyncMock(return_value=[])

    app.dependency_overrides[get_current_astronaut] = lambda: user
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/2",
        json={"hobbies": "music", "client": "Acme"},
    )

    assert response.status_code == 200
    mock_repo.update_profile.assert_called_once()
    called_fields = mock_repo.update_profile.call_args[0][1]
    assert called_fields == {"hobbies": "music", "client": "Acme"}


async def test_patch_profile_admin_updates_other(client: AsyncClient) -> None:
    """Admin peut modifier le profil d'un autre astronaute → 200."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])
    target = make_astronaut(3, "target@eleven-labs.com", ["astronaut"])
    updated = make_astronaut(3, "target@eleven-labs.com", ["astronaut"], photo_url="https://example.com/photo.jpg")

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=target)
    mock_repo.update_profile = AsyncMock(return_value=updated)

    mock_grade_repo = MagicMock()
    mock_grade_repo.get_all = AsyncMock(return_value=[])

    app.dependency_overrides[get_current_astronaut] = lambda: admin
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/3",
        json={"photo_url": "https://example.com/photo.jpg"},
    )

    assert response.status_code == 200
    mock_repo.update_profile.assert_called_once()


async def test_patch_profile_forbidden_for_other_user(client: AsyncClient) -> None:
    """Astronaute ne peut pas modifier le profil d'un autre → 403."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    user = make_astronaut(2, "user@eleven-labs.com", ["astronaut"])

    mock_repo = MagicMock()
    mock_grade_repo = MagicMock()

    app.dependency_overrides[get_current_astronaut] = lambda: user
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/99",
        json={"hobbies": "hacking"},
    )

    assert response.status_code == 403
    assert "propre profil" in response.json()["detail"]


async def test_patch_profile_target_not_found(client: AsyncClient) -> None:
    """Astronaute inexistant → 404."""
    from src.api.v1.astronauts import _astronaut_repo, _grade_repo

    admin = make_astronaut(1, "admin@eleven-labs.com", ["astronaut", "admin"])

    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=None)
    mock_grade_repo = MagicMock()
    mock_grade_repo.get_all = AsyncMock(return_value=[])

    app.dependency_overrides[get_current_astronaut] = lambda: admin
    app.dependency_overrides[_astronaut_repo] = lambda: mock_repo
    app.dependency_overrides[_grade_repo] = lambda: mock_grade_repo

    response = await client.patch(
        "/api/v1/astronauts/9999",
        json={"hobbies": "coding"},
    )

    assert response.status_code == 404


async def test_patch_profile_unauthenticated(client: AsyncClient) -> None:
    """Sans token → 401."""
    response = await client.patch(
        "/api/v1/astronauts/1",
        json={"hobbies": "coding"},
    )

    assert response.status_code == 401
