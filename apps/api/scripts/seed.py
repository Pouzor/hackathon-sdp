"""
Script de seed de la base de données.

Usage :
    uv run python scripts/seed.py          # insère les données (idempotent)
    uv run python scripts/seed.py --reset  # vide TOUTES les tables puis insère
"""

import asyncio
import sys
from datetime import UTC, date, datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.core.config import settings
from src.models.activity import Activity
from src.models.astronaut import Astronaut
from src.models.grade import Grade
from src.models.planet import Planet
from src.models.point_attribution import PointAttribution
from src.models.season import Season
from src.models.season_planet_score import SeasonPlanetScore
from src.models.seniority_config import SeniorityConfig

# ─── Données fixtures ────────────────────────────────────────────────────────

PLANETS = [
    {
        "name": "HQ",
        "mantra": "Le QG de tous les explorateurs",
        "color_hex": "#b8c8e8",
        "is_competing": False,
        "is_default_for_newcomers": True,
    },
    {
        "name": "Duck Invaders",
        "mantra": "On envahit, on conquiert, on canarde.",
        "color_hex": "#22c55e",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "SchizoCats",
        "mantra": "Imprévisibles. Brillants. Toujours debout.",
        "color_hex": "#3b82f6",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Donut Factory",
        "mantra": "On produit, on livre, on régale.",
        "color_hex": "#ec4899",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
    {
        "name": "Raccoons of Asgard",
        "mantra": "Rusés comme des ratons, puissants comme des dieux.",
        "color_hex": "#eab308",
        "is_competing": True,
        "is_default_for_newcomers": False,
    },
]

GRADES = [
    {"name": "Rookie", "threshold_points": 0, "order": 1},
    {"name": "Ensign", "threshold_points": 50, "order": 2},
    {"name": "Lieutenant", "threshold_points": 100, "order": 3},
    {"name": "Lt. Commander", "threshold_points": 200, "order": 4},
    {"name": "Commander", "threshold_points": 300, "order": 5},
    {"name": "Captain", "threshold_points": 500, "order": 6},
    {"name": "Fleet Captain", "threshold_points": 750, "order": 7},
    {"name": "Commodore", "threshold_points": 1000, "order": 8},
    {"name": "Rear Admiral", "threshold_points": 1500, "order": 9},
    {"name": "Vice Admiral", "threshold_points": 2000, "order": 10},
    {"name": "Admiral", "threshold_points": 3000, "order": 11},
    {"name": "Fleet Admiral", "threshold_points": 5000, "order": 12},
    {"name": "Fleet Adm. ★★", "threshold_points": 10000, "order": 13},
    {"name": "Fleet Adm. ★★★", "threshold_points": 15000, "order": 14},
]

ACTIVITIES = [
    {
        "name": "Talk interne",
        "base_points": 50,
        "category": "knowledge",
        "is_collaborative": False,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Article de blog",
        "base_points": 75,
        "category": "knowledge",
        "is_collaborative": False,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Conférence externe",
        "base_points": 100,
        "category": "knowledge",
        "is_collaborative": False,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Podcast",
        "base_points": 60,
        "category": "knowledge",
        "is_collaborative": False,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Open source contribution",
        "base_points": 80,
        "category": "tech",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Hackathon",
        "base_points": 120,
        "category": "tech",
        "is_collaborative": True,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Recrutement (cooptation)",
        "base_points": 150,
        "category": "people",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Mentorat",
        "base_points": 40,
        "category": "people",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
    {
        "name": "Organisation d'événement",
        "base_points": 90,
        "category": "community",
        "is_collaborative": True,
        "allow_multiple_assignees": True,
    },
    {
        "name": "Participation forum interne",
        "base_points": 20,
        "category": "community",
        "is_collaborative": False,
        "allow_multiple_assignees": False,
    },
]

# Astronautes fictifs — un admin + plusieurs par planète
ASTRONAUTS_DATA = [
    # Admin
    {
        "email": "admin@eleven-labs.com",
        "first_name": "Admin",
        "last_name": "Système",
        "hobbies": "Configurer des bases de données",
        "client": None,
        "hire_date": date(2020, 1, 6),
        "roles": ["astronaut", "admin"],
        "planet_slug": "hq",
    },
    # HQ
    {
        "email": "lea.martin@eleven-labs.com",
        "first_name": "Léa",
        "last_name": "Martin",
        "hobbies": "Yoga, lecture",
        "client": None,
        "hire_date": date(2021, 3, 15),
        "roles": ["astronaut"],
        "planet_slug": "hq",
    },
    # Duck Invaders
    {
        "email": "tom.bernard@eleven-labs.com",
        "first_name": "Tom",
        "last_name": "Bernard",
        "hobbies": "Gaming, escalade",
        "client": "Natixis",
        "hire_date": date(2019, 9, 2),
        "roles": ["astronaut"],
        "planet_slug": "duck",
    },
    {
        "email": "chloe.dupont@eleven-labs.com",
        "first_name": "Chloé",
        "last_name": "Dupont",
        "hobbies": "Photographie, vélo",
        "client": "SNCF",
        "hire_date": date(2022, 1, 10),
        "roles": ["astronaut"],
        "planet_slug": "duck",
    },
    {
        "email": "hugo.petit@eleven-labs.com",
        "first_name": "Hugo",
        "last_name": "Petit",
        "hobbies": "Guitare, randonnée",
        "client": "BNP",
        "hire_date": date(2020, 6, 1),
        "roles": ["astronaut"],
        "planet_slug": "duck",
    },
    # SchizoCats
    {
        "email": "alice.leroy@eleven-labs.com",
        "first_name": "Alice",
        "last_name": "Leroy",
        "hobbies": "Danse contemporaine, origami",
        "client": "Canal+",
        "hire_date": date(2023, 2, 20),
        "roles": ["astronaut"],
        "planet_slug": "cats",
    },
    {
        "email": "maxime.roux@eleven-labs.com",
        "first_name": "Maxime",
        "last_name": "Roux",
        "hobbies": "Football, cuisine",
        "client": "Engie",
        "hire_date": date(2021, 11, 8),
        "roles": ["astronaut"],
        "planet_slug": "cats",
    },
    {
        "email": "sarah.moreau@eleven-labs.com",
        "first_name": "Sarah",
        "last_name": "Moreau",
        "hobbies": "Peinture, jeux de société",
        "client": "Société Générale",
        "hire_date": date(2022, 9, 5),
        "roles": ["astronaut"],
        "planet_slug": "cats",
    },
    # Donut Factory
    {
        "email": "julien.simon@eleven-labs.com",
        "first_name": "Julien",
        "last_name": "Simon",
        "hobbies": "Triathlon, lecture SF",
        "client": "Fnac",
        "hire_date": date(2018, 4, 12),
        "roles": ["astronaut"],
        "planet_slug": "donut",
    },
    {
        "email": "emma.garcia@eleven-labs.com",
        "first_name": "Emma",
        "last_name": "Garcia",
        "hobbies": "Cinéma, tennis",
        "client": "Decathlon",
        "hire_date": date(2023, 6, 26),
        "roles": ["astronaut"],
        "planet_slug": "donut",
    },
    {
        "email": "lucas.thomas@eleven-labs.com",
        "first_name": "Lucas",
        "last_name": "Thomas",
        "hobbies": "Skateboard, podcast tech",
        "client": "Carrefour",
        "hire_date": date(2021, 7, 19),
        "roles": ["astronaut"],
        "planet_slug": "donut",
    },
    # Raccoons of Asgard
    {
        "email": "noemie.blanc@eleven-labs.com",
        "first_name": "Noémie",
        "last_name": "Blanc",
        "hobbies": "Aquarelle, course à pied",
        "client": "TotalEnergies",
        "hire_date": date(2020, 2, 3),
        "roles": ["astronaut"],
        "planet_slug": "raccoon",
    },
    {
        "email": "remi.noir@eleven-labs.com",
        "first_name": "Rémi",
        "last_name": "Noir",
        "hobbies": "Musique électronique, surf",
        "client": "AXA",
        "hire_date": date(2019, 5, 27),
        "roles": ["astronaut"],
        "planet_slug": "raccoon",
    },
    {
        "email": "camille.david@eleven-labs.com",
        "first_name": "Camille",
        "last_name": "David",
        "hobbies": "Volleyball, dessin",
        "client": "Capgemini",
        "hire_date": date(2022, 4, 4),
        "roles": ["astronaut"],
        "planet_slug": "raccoon",
    },
]

# Slug → nom de planète (pour résolution à l'insertion)
SLUG_TO_NAME = {
    "hq": "HQ",
    "duck": "Duck Invaders",
    "cats": "SchizoCats",
    "donut": "Donut Factory",
    "raccoon": "Raccoons of Asgard",
}

# Scores initiaux par planète (saison active)
SEASON_SCORES: dict[str, int] = {
    "Duck Invaders": 1240,
    "SchizoCats": 980,
    "Donut Factory": 1560,
    "Raccoons of Asgard": 820,
}

# ─── Helpers ─────────────────────────────────────────────────────────────────


def now_utc() -> datetime:
    return datetime.now(UTC)


async def reset_db(session: AsyncSession) -> None:
    """Vide toutes les tables dans le bon ordre (FK oblige)."""
    print("  🗑  Suppression des données existantes…")
    # Allowlist of tables safe to truncate — never interpolate user input here
    _ALLOWED_TABLES = frozenset(
        {
            "point_attributions",
            "season_planet_scores",
            "astronauts",
            "activities",
            "grades",
            "seasons",
            "planets",
            "seniority_config",
        }
    )
    for table in _ALLOWED_TABLES:
        # Table names come exclusively from the hardcoded allowlist — no user input
        await session.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))  # noqa: S608
    await session.commit()
    print("  ✓  Tables vidées")


async def seed(session: AsyncSession) -> None:
    print("  🌍  Insertion des planètes…")
    planet_map: dict[str, int] = {}
    for p in PLANETS:
        planet = Planet(**p)
        session.add(planet)
        await session.flush()
        planet_map[p["name"]] = planet.id
    await session.commit()
    print(f"     → {len(PLANETS)} planètes créées")

    print("  📅  Création de la saison active…")
    season = Season(
        name="Saison 2026",
        start_date=date(2025, 9, 1),
        end_date=date(2026, 8, 31),
        is_active=True,
    )
    session.add(season)
    await session.flush()
    season_id = season.id
    await session.commit()
    print(f"     → Saison #{season_id} créée")

    print("  🏆  Insertion des grades…")
    for g in GRADES:
        session.add(Grade(**g))
    await session.commit()
    print(f"     → {len(GRADES)} grades créés")

    print("  ⚡  Insertion des activités…")
    activity_objs: list[Activity] = []
    for a in ACTIVITIES:
        act = Activity(**a)
        session.add(act)
        activity_objs.append(act)
    await session.flush()
    activity_ids = [a.id for a in activity_objs]
    await session.commit()
    print(f"     → {len(ACTIVITIES)} activités créées")

    print("  ⚙   Configuration de l'ancienneté…")
    session.add(SeniorityConfig(points_per_year=50))
    await session.commit()

    print("  👩‍🚀  Insertion des astronautes…")
    astronaut_map: dict[str, int] = {}
    for astro_data in ASTRONAUTS_DATA:
        # Copy to avoid mutating the module-level ASTRONAUTS_DATA constant
        data = dict(astro_data)
        slug = data.pop("planet_slug")
        planet_name = SLUG_TO_NAME[slug]
        astro = Astronaut(
            **data,
            planet_id=planet_map.get(planet_name),
        )
        session.add(astro)
        await session.flush()
        astronaut_map[astro.email] = astro.id
    await session.commit()
    print(f"     → {len(ASTRONAUTS_DATA)} astronautes créés")

    print("  🎯  Attribution de points exemples…")
    admin_id = astronaut_map["admin@eleven-labs.com"]
    attributions = [
        # Duck Invaders
        ("tom.bernard@eleven-labs.com", "Duck Invaders", 0, 100, False, False),
        ("chloe.dupont@eleven-labs.com", "Duck Invaders", 1, 150, True, False),
        ("hugo.petit@eleven-labs.com", "Duck Invaders", 2, 50, False, True),
        ("tom.bernard@eleven-labs.com", "Duck Invaders", 5, 120, False, False),
        ("chloe.dupont@eleven-labs.com", "Duck Invaders", 3, 60, False, False),
        # SchizoCats
        ("alice.leroy@eleven-labs.com", "SchizoCats", 0, 100, False, False),
        ("maxime.roux@eleven-labs.com", "SchizoCats", 4, 80, False, False),
        ("sarah.moreau@eleven-labs.com", "SchizoCats", 1, 75, True, False),
        # Donut Factory
        ("julien.simon@eleven-labs.com", "Donut Factory", 2, 50, False, False),
        ("emma.garcia@eleven-labs.com", "Donut Factory", 6, 150, False, False),
        ("lucas.thomas@eleven-labs.com", "Donut Factory", 0, 100, False, False),
        ("julien.simon@eleven-labs.com", "Donut Factory", 9, 20, False, False),
        ("emma.garcia@eleven-labs.com", "Donut Factory", 7, 40, False, False),
        # Raccoons of Asgard
        ("noemie.blanc@eleven-labs.com", "Raccoons of Asgard", 3, 60, False, False),
        ("remi.noir@eleven-labs.com", "Raccoons of Asgard", 0, 100, True, False),
        ("camille.david@eleven-labs.com", "Raccoons of Asgard", 1, 75, False, True),
    ]
    # Compute total_points per astronaut
    points_per_astro: dict[int, int] = {}
    for email, planet_name, act_idx, pts, _fev, _fsb in attributions:
        astro_id = astronaut_map[email]
        points_per_astro[astro_id] = points_per_astro.get(astro_id, 0) + pts
        pa = PointAttribution(
            astronaut_id=astro_id,
            planet_id=planet_map[planet_name],
            activity_id=activity_ids[act_idx],
            season_id=season_id,
            awarded_by=admin_id,
            points=pts,
            first_ever_multiplier_applied=_fev,
            first_season_bonus_applied=_fsb,
            awarded_at=now_utc(),
        )
        session.add(pa)

    # Update total_points on astronauts
    from sqlalchemy import update

    from src.models.astronaut import Astronaut as AstronautModel

    for astro_id, total in points_per_astro.items():
        await session.execute(
            update(AstronautModel).where(AstronautModel.id == astro_id).values(total_points=total)
        )
    await session.commit()
    print(f"     → {len(attributions)} attributions créées")

    print("  📊  Scores de saison par planète…")
    for planet_name, score in SEASON_SCORES.items():
        sps = SeasonPlanetScore(
            season_id=season_id,
            planet_id=planet_map[planet_name],
            points=score,
        )
        session.add(sps)
    await session.commit()
    print(f"     → {len(SEASON_SCORES)} scores insérés")


# ─── Entrypoint ──────────────────────────────────────────────────────────────


async def main() -> None:
    do_reset = "--reset" in sys.argv

    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    print("\n🚀  Seed — Site des Planètes\n")
    if do_reset:
        print("⚠   Mode --reset : toutes les données existantes seront supprimées\n")

    async with async_session() as session:
        if do_reset:
            await reset_db(session)
        await seed(session)

    await engine.dispose()
    print("\n✅  Seed terminé avec succès !\n")


if __name__ == "__main__":
    asyncio.run(main())
