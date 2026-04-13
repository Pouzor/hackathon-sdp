"""Tests unitaires pour GradeRepository.get_for_points."""

from unittest.mock import AsyncMock, MagicMock

from src.repositories.grade import GradeRepository


def make_grade(name: str, threshold: int, order: int) -> MagicMock:
    g = MagicMock()
    g.name = name
    g.threshold_points = threshold
    g.order = order
    return g


GRADES = [
    make_grade("Rookie", 0, 1),
    make_grade("Cadet", 100, 2),
    make_grade("Commander", 1000, 5),
    make_grade("Fleet Admiral ★★★", 20000, 13),
]


async def test_get_grade_for_zero_points() -> None:
    """0 pts → Rookie."""
    mock_db = MagicMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = GRADES[0]
    mock_db.execute = AsyncMock(return_value=mock_result)
    repo = GradeRepository(mock_db)
    grade = await repo.get_for_points(0)
    assert grade is not None
    assert grade.name == "Rookie"


async def test_get_grade_for_high_points() -> None:
    """10000 pts → Fleet Admiral ★★★ si c'est le plus élevé ≤ 10000."""
    mock_db = MagicMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = GRADES[2]  # Commander
    mock_db.execute = AsyncMock(return_value=mock_result)
    repo = GradeRepository(mock_db)
    grade = await repo.get_for_points(1500)
    assert grade is not None
    assert grade.name == "Commander"
