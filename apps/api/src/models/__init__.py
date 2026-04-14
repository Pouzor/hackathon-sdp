# Import all models here so Alembic can discover them
from src.models.activity import Activity
from src.models.astronaut import Astronaut
from src.models.grade import Grade
from src.models.planet import Planet
from src.models.point_attribution import PointAttribution
from src.models.season import Season
from src.models.season_planet_score import SeasonPlanetScore
from src.models.seniority_config import SeniorityConfig
from src.models.trophy import Trophy
from src.models.trophy_attribution import TrophyAttribution

__all__ = [
    "Activity",
    "Astronaut",
    "Grade",
    "Planet",
    "PointAttribution",
    "Season",
    "SeasonPlanetScore",
    "SeniorityConfig",
    "Trophy",
    "TrophyAttribution",
]
