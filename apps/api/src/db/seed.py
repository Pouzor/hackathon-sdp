"""Script de seed pour l'environnement de développement.

Usage:
    uv run python -m src.db.seed
"""

import asyncio

from sqlalchemy import select

from src.db.session import get_session_factory
from src.models.activity import Activity
from src.models.grade import Grade
from src.models.planet import Planet
from src.models.seniority_config import SeniorityConfig

PLANETS = [
    {
        "name": "Mercure",
        "mantra": "Placeholder — à renseigner",
        "color_hex": "#B5B5B5",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Vénus",
        "mantra": "Placeholder — à renseigner",
        "color_hex": "#E8C97A",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Mars",
        "mantra": "Placeholder — à renseigner",
        "color_hex": "#C1440E",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Jupiter",
        "mantra": "Placeholder — à renseigner",
        "color_hex": "#C88B3A",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Pluton",
        "mantra": "Planète des nouveaux arrivants",
        "color_hex": "#6B7280",
        "is_competing": False,
        "is_default_for_newcomers": True,
    },
    {
        "name": "Saturne",
        "mantra": "Planète des arbitres",
        "color_hex": "#9CA3AF",
        "is_competing": False,
        "is_default_for_newcomers": False,
    },
]

# 14 grades selon le brief
GRADES = [
    {"name": "Rookie", "threshold_points": 0, "order": 1},
    {"name": "Cadet", "threshold_points": 100, "order": 2},
    {"name": "Ensign", "threshold_points": 250, "order": 3},
    {"name": "Lieutenant", "threshold_points": 500, "order": 4},
    {"name": "Commander", "threshold_points": 1000, "order": 5},
    {"name": "Captain", "threshold_points": 2000, "order": 6},
    {"name": "Commodore", "threshold_points": 3500, "order": 7},
    {"name": "Rear Admiral", "threshold_points": 5000, "order": 8},
    {"name": "Vice Admiral", "threshold_points": 7000, "order": 9},
    {"name": "Admiral", "threshold_points": 9500, "order": 10},
    {"name": "Fleet Admiral ★", "threshold_points": 12500, "order": 11},
    {"name": "Fleet Admiral ★★", "threshold_points": 16000, "order": 12},
    {"name": "Fleet Admiral ★★★", "threshold_points": 20000, "order": 13},
]

ACTIVITIES = [
    {
        "name": "Article de blog",
        "base_points": 40,
        "category": "contenu",
        "is_collaborative": True,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Talk interne",
        "base_points": 60,
        "category": "partage",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Talk conférence externe",
        "base_points": 80,
        "category": "partage",
        "is_collaborative": True,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Workshop animé",
        "base_points": 60,
        "category": "partage",
        "is_collaborative": True,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Contribution open source",
        "base_points": 50,
        "category": "technique",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Recrutement (cooptation)",
        "base_points": 100,
        "category": "recrutement",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Parrainage nouveau",
        "base_points": 30,
        "category": "recrutement",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Participation challenge",
        "base_points": 30,
        "category": "challenge",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Points d'ancienneté",
        "base_points": 0,  # calculé dynamiquement
        "category": "anciennete",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
]


async def seed() -> None:
    factory = get_session_factory()
    async with factory() as session:
        # Planets
        existing = await session.execute(select(Planet))
        if not existing.scalars().first():
            for p in PLANETS:
                session.add(Planet(**p))
            print(f"✓ {len(PLANETS)} planètes créées")
        else:
            print("- Planètes déjà présentes, skip")

        # Grades
        existing = await session.execute(select(Grade))
        if not existing.scalars().first():
            for g in GRADES:
                session.add(Grade(**g))
            print(f"✓ {len(GRADES)} grades créés")
        else:
            print("- Grades déjà présents, skip")

        # Activities
        existing = await session.execute(select(Activity))
        if not existing.scalars().first():
            for a in ACTIVITIES:
                session.add(Activity(**a))
            print(f"✓ {len(ACTIVITIES)} activités créées")
        else:
            print("- Activités déjà présentes, skip")

        # SeniorityConfig
        existing = await session.execute(select(SeniorityConfig))
        if not existing.scalars().first():
            session.add(SeniorityConfig(points_per_year=50))
            print("✓ Configuration ancienneté créée (50 pts/an)")
        else:
            print("- Configuration ancienneté déjà présente, skip")

        await session.commit()
        print("\nSeed terminé ✓")


if __name__ == "__main__":
    asyncio.run(seed())
