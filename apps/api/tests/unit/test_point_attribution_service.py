"""Tests unitaires — règles métier critiques d'attribution de points.

F-301 : Attribution de base
F-302 : Multi-assignee
F-303 : Multiplicateur ×2 sur 1ère contribution ever
F-304 : Bonus +25 sur 1ère contribution de la saison
F-306 : Suppression avec recalcul
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from src.services.point_attribution import (
    FIRST_EVER_MULTIPLIER,
    FIRST_SEASON_BONUS,
    PointAttributionService,
)


def make_service() -> tuple[PointAttributionService, MagicMock]:
    """Retourne (service, mock_db) avec tous les repos mockés."""
    mock_db = MagicMock()
    service = PointAttributionService(mock_db)

    # Repos mockés
    service._pa_repo = MagicMock()
    service._astronaut_repo = MagicMock()
    service._activity_repo = MagicMock()
    service._season_repo = MagicMock()

    return service, mock_db


def make_astronaut(id: int = 1, planet_id: int = 1, total_points: int = 0) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.email = f"astronaut{id}@eleven-labs.com"
    a.planet_id = planet_id
    a.total_points = total_points
    return a


def make_activity(
    id: int = 1,
    base_points: int = 40,
    allow_multiple_assignees: bool = False,
    name: str = "Article",
) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.name = name
    a.base_points = base_points
    a.allow_multiple_assignees = allow_multiple_assignees
    return a


def make_season(id: int = 1) -> MagicMock:
    s = MagicMock()
    s.id = id
    return s


def make_attribution(id: int = 1, points: int = 40, astronaut_id: int = 1) -> MagicMock:
    a = MagicMock()
    a.id = id
    a.points = points
    a.astronaut_id = astronaut_id
    a.planet_id = 1
    a.season_id = 1
    a.is_deleted = False
    return a


# ─── Validation ─────────────────────────────────────────────────────────────

async def test_no_active_season_raises_400() -> None:
    service, _ = make_service()
    service._season_repo.get_active = AsyncMock(return_value=None)
    admin = make_astronaut()

    with pytest.raises(HTTPException) as exc:
        await service.attribute_points([1], activity_id=1, awarded_by=admin)
    assert exc.value.status_code == 400


async def test_unknown_activity_raises_422() -> None:
    service, _ = make_service()
    service._season_repo.get_active = AsyncMock(return_value=make_season())
    service._activity_repo.get_by_id = AsyncMock(return_value=None)
    admin = make_astronaut()

    with pytest.raises(HTTPException) as exc:
        await service.attribute_points([1], activity_id=99, awarded_by=admin)
    assert exc.value.status_code == 422


async def test_unknown_astronaut_raises_422() -> None:
    service, _ = make_service()
    service._season_repo.get_active = AsyncMock(return_value=make_season())
    service._activity_repo.get_by_id = AsyncMock(return_value=make_activity())
    service._astronaut_repo.get_by_id = AsyncMock(return_value=None)
    admin = make_astronaut()

    with pytest.raises(HTTPException) as exc:
        await service.attribute_points([99], activity_id=1, awarded_by=admin)
    assert exc.value.status_code == 422


async def test_astronaut_without_planet_raises_400() -> None:
    service, _ = make_service()
    service._season_repo.get_active = AsyncMock(return_value=make_season())
    service._activity_repo.get_by_id = AsyncMock(return_value=make_activity())
    astronaut_no_planet = make_astronaut(planet_id=None)  # type: ignore[arg-type]
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut_no_planet)
    admin = make_astronaut()

    with pytest.raises(HTTPException) as exc:
        await service.attribute_points([1], activity_id=1, awarded_by=admin)
    assert exc.value.status_code == 400


# ─── F-302 : Multi-assignee ──────────────────────────────────────────────────

async def test_multiple_astronauts_non_collaborative_raises_400() -> None:
    service, _ = make_service()
    service._season_repo.get_active = AsyncMock(return_value=make_season())
    activity = make_activity(allow_multiple_assignees=False)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    admin = make_astronaut()

    with pytest.raises(HTTPException) as exc:
        await service.attribute_points([1, 2], activity_id=1, awarded_by=admin)
    assert exc.value.status_code == 400


# ─── F-301 : Attribution de base ────────────────────────────────────────────

async def test_basic_attribution_uses_activity_base_points() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=100)
    attribution = make_attribution(points=40)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=5)  # pas 1ère
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=2)  # pas 1ère saison
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    service._season_repo.decrement_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    result = await service.attribute_points([1], activity_id=1, awarded_by=admin)

    assert len(result) == 1
    # Points = 40 base, pas de multiplicateur, pas de bonus
    service._pa_repo.create.assert_called_once()
    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 40
    assert call_kwargs["first_ever_multiplier_applied"] is False
    assert call_kwargs["first_season_bonus_applied"] is False
    # total_points mis à jour
    assert astronaut.total_points == 140


# ─── F-303 : Multiplicateur ×2 sur 1ère contribution ever ───────────────────

async def test_first_ever_contribution_applies_multiplier() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=0)
    attribution = make_attribution(points=80)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=0)  # 1ère ever
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=5)  # pas 1ère saison
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 40 * FIRST_EVER_MULTIPLIER  # 80
    assert call_kwargs["first_ever_multiplier_applied"] is True
    assert call_kwargs["first_season_bonus_applied"] is False


async def test_second_contribution_no_multiplier() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=80)
    attribution = make_attribution(points=40)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=1)  # pas 1ère
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=5)
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 40
    assert call_kwargs["first_ever_multiplier_applied"] is False


# ─── F-304 : Bonus +25 sur 1ère contribution de la saison ───────────────────

async def test_first_season_contribution_adds_bonus() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=100)
    attribution = make_attribution(points=65)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=3)  # pas 1ère ever
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=0)  # 1ère saison
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 40 + FIRST_SEASON_BONUS  # 65
    assert call_kwargs["first_season_bonus_applied"] is True
    assert call_kwargs["first_ever_multiplier_applied"] is False


async def test_second_season_contribution_no_bonus() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=100)
    attribution = make_attribution(points=40)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=3)
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=1)  # pas 1ère
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 40
    assert call_kwargs["first_season_bonus_applied"] is False


# ─── Cas combiné : 1ère ever + 1ère saison ──────────────────────────────────

async def test_first_ever_and_first_season_cumulates_both() -> None:
    """1ère contribution ever ET 1ère de la saison : ×2 puis +25."""
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=0)
    attribution = make_attribution(points=105)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=0)  # 1ère ever
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=0)  # 1ère saison
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    expected = 40 * FIRST_EVER_MULTIPLIER + FIRST_SEASON_BONUS  # 80 + 25 = 105
    assert call_kwargs["points"] == expected
    assert call_kwargs["first_ever_multiplier_applied"] is True
    assert call_kwargs["first_season_bonus_applied"] is True


# ─── F-302 : Co-auteurs reçoivent chacun le total ───────────────────────────

async def test_collaborative_each_coauthor_gets_full_points() -> None:
    """Article à deux : chaque auteur reçoit 40 pts (pas de split)."""
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40, allow_multiple_assignees=True)
    astronaut1 = make_astronaut(id=1, total_points=100)
    astronaut2 = make_astronaut(id=2, total_points=50)
    attribution1 = make_attribution(id=1, points=40, astronaut_id=1)
    attribution2 = make_attribution(id=2, points=40, astronaut_id=2)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(
        side_effect=[astronaut1, astronaut2]
    )
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=5)
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=2)
    service._pa_repo.create = AsyncMock(side_effect=[attribution1, attribution2])
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    results = await service.attribute_points([1, 2], activity_id=1, awarded_by=admin)

    assert len(results) == 2
    # Les deux reçoivent 40 pts chacun (base_points, sans modificateurs)
    calls = service._pa_repo.create.call_args_list
    assert calls[0].kwargs["points"] == 40
    assert calls[1].kwargs["points"] == 40
    assert astronaut1.total_points == 140
    assert astronaut2.total_points == 90


# ─── F-306 : Suppression avec recalcul ──────────────────────────────────────

async def test_delete_attribution_decrements_totals() -> None:
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()

    astronaut = make_astronaut(total_points=140)
    attribution = make_attribution(points=40, astronaut_id=1)
    deleted_attribution = make_attribution(points=40, astronaut_id=1)
    deleted_attribution.is_deleted = True

    service._pa_repo.get_by_id = AsyncMock(return_value=attribution)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._season_repo.decrement_planet_score = AsyncMock()
    service._pa_repo.soft_delete = AsyncMock(return_value=deleted_attribution)
    admin = make_astronaut(id=99)

    result = await service.delete_attribution(1, deleted_by=admin, reason="Erreur de saisie")

    assert result.is_deleted is True
    assert astronaut.total_points == 100  # 140 - 40
    service._season_repo.decrement_planet_score.assert_called_once()
    service._pa_repo.soft_delete.assert_called_once_with(
        attribution=attribution,
        deleted_by=99,
        reason="Erreur de saisie",
    )


async def test_delete_already_deleted_raises_404() -> None:
    service, _ = make_service()
    already_deleted = make_attribution()
    already_deleted.is_deleted = True
    service._pa_repo.get_by_id = AsyncMock(return_value=already_deleted)
    admin = make_astronaut(id=99)

    with pytest.raises(HTTPException) as exc:
        await service.delete_attribution(1, deleted_by=admin, reason="test")
    assert exc.value.status_code == 404


async def test_delete_missing_attribution_raises_404() -> None:
    service, _ = make_service()
    service._pa_repo.get_by_id = AsyncMock(return_value=None)
    admin = make_astronaut(id=99)

    with pytest.raises(HTTPException) as exc:
        await service.delete_attribution(999, deleted_by=admin, reason="test")
    assert exc.value.status_code == 404


# ─── Grades ─────────────────────────────────────────────────────────────────

async def test_custom_points_override_base_points() -> None:
    """Points personnalisés overrident les base_points de l'activité."""
    service, mock_db = make_service()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()

    season = make_season()
    activity = make_activity(base_points=40)
    astronaut = make_astronaut(total_points=0)
    attribution = make_attribution(points=100)

    service._season_repo.get_active = AsyncMock(return_value=season)
    service._activity_repo.get_by_id = AsyncMock(return_value=activity)
    service._astronaut_repo.get_by_id = AsyncMock(return_value=astronaut)
    service._pa_repo.count_by_astronaut = AsyncMock(return_value=5)
    service._pa_repo.count_by_astronaut_and_season = AsyncMock(return_value=2)
    service._pa_repo.create = AsyncMock(return_value=attribution)
    service._season_repo.increment_planet_score = AsyncMock()
    admin = make_astronaut(id=99)

    await service.attribute_points([1], activity_id=1, awarded_by=admin, custom_points=100)

    call_kwargs = service._pa_repo.create.call_args.kwargs
    assert call_kwargs["points"] == 100  # custom, pas 40
