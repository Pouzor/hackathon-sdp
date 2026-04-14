"""Cron quotidien — attribution automatique des points d'ancienneté.

Logique :
- Tourne une fois par jour (lancé via APScheduler depuis main.py).
- Pour chaque astronaute avec une hire_date et une planète :
    - Si aujourd'hui == anniversaire de hire_date (même mois, même jour)
    - Et années complètes >= 1
    - Et aucune attribution d'ancienneté déjà créée cette année civile (idempotence)
  → Crée une PointAttribution avec points = years × points_per_year
"""

import logging
from datetime import UTC, date, datetime

from sqlalchemy import select

from src.db.session import get_session_factory
from src.models.activity import Activity
from src.models.seniority_config import SeniorityConfig
from src.repositories.astronaut import AstronautRepository
from src.repositories.point_attribution import PointAttributionRepository
from src.repositories.season import SeasonRepository

logger = logging.getLogger(__name__)


async def run_seniority_cron() -> None:
    """Point d'entrée du cron — appelé quotidiennement par APScheduler."""
    today = date.today()
    logger.info("Seniority cron: démarrage pour le %s", today.isoformat())

    factory = get_session_factory()
    async with factory() as db:
        season_repo = SeasonRepository(db)
        astronaut_repo = AstronautRepository(db)
        pa_repo = PointAttributionRepository(db)

        # Saison active requise pour créer des attributions
        season = await season_repo.get_active()
        if season is None:
            logger.info("Seniority cron: aucune saison active, skip.")
            return

        # Configuration ancienneté
        config_result = await db.execute(select(SeniorityConfig))
        config = config_result.scalar_one_or_none()
        if config is None:
            logger.warning("Seniority cron: SeniorityConfig introuvable, skip.")
            return

        # Activité "ancienneté" (catégorie = "anciennete")
        activity_result = await db.execute(
            select(Activity).where(Activity.category == "anciennete")
        )
        activity = activity_result.scalar_one_or_none()
        if activity is None:
            logger.warning("Seniority cron: activité 'anciennete' introuvable, skip.")
            return

        # Parcours de tous les astronautes
        astronauts = await astronaut_repo.get_all()
        created = 0
        skipped_no_date = 0
        skipped_no_planet = 0
        skipped_not_today = 0
        skipped_already_done = 0

        for astronaut in astronauts:
            if astronaut.hire_date is None:
                skipped_no_date += 1
                continue
            if astronaut.planet_id is None:
                skipped_no_planet += 1
                continue

            # Anniversaire aujourd'hui ?
            if (
                astronaut.hire_date.month != today.month
                or astronaut.hire_date.day != today.day
            ):
                skipped_not_today += 1
                continue

            years = today.year - astronaut.hire_date.year
            if years <= 0:
                # Embauché cette année, pas encore d'anniversaire
                continue

            points = years * config.points_per_year

            # Idempotence : déjà attribué cette année civile ?
            already = await pa_repo.has_seniority_attribution(
                astronaut_id=astronaut.id,
                activity_id=activity.id,
                year=today.year,
            )
            if already:
                skipped_already_done += 1
                logger.debug(
                    "Seniority cron: astronaute %s déjà traité cette année, skip.",
                    astronaut.email,
                )
                continue

            # Création de l'attribution (awarded_by=None = système)
            await pa_repo.create(
                astronaut_id=astronaut.id,
                planet_id=astronaut.planet_id,
                activity_id=activity.id,
                season_id=season.id,
                awarded_by=None,
                points=points,
                comment=(
                    f"Points d'ancienneté : {years} an{'s' if years > 1 else ''} "
                    f"({years} × {config.points_per_year} pts)"
                ),
                awarded_at=datetime.now(UTC),
            )

            astronaut.total_points += points

            await season_repo.increment_planet_score(
                season_id=season.id,
                planet_id=astronaut.planet_id,
                points=points,
            )

            logger.info(
                "Seniority cron: +%d pts pour %s (%d ans)",
                points,
                astronaut.email,
                years,
            )
            created += 1

        await db.commit()
        logger.info(
            "Seniority cron: terminé. %d attribution(s) créée(s), "
            "%d skip(s) déjà fait, %d pas anniversaire aujourd'hui, "
            "%d sans date, %d sans planète.",
            created,
            skipped_already_done,
            skipped_not_today,
            skipped_no_date,
            skipped_no_planet,
        )
