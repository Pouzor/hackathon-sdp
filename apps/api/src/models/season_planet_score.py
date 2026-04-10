from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class SeasonPlanetScore(Base):
    """Compteur de points par planète et par saison (reset à chaque saison)."""

    __tablename__ = "season_planet_scores"
    __table_args__ = (UniqueConstraint("season_id", "planet_id", name="uq_season_planet"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    planet_id: Mapped[int] = mapped_column(
        ForeignKey("planets.id", ondelete="CASCADE"), nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
