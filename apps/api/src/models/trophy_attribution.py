from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class TrophyAttribution(Base):
    __tablename__ = "trophy_attributions"
    __table_args__ = (
        # Exactement l'un des deux doit être renseigné
        CheckConstraint(
            "(astronaut_id IS NULL) != (planet_id IS NULL)",
            name="ck_trophy_attribution_target",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    trophy_id: Mapped[int] = mapped_column(
        ForeignKey("trophies.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    astronaut_id: Mapped[int | None] = mapped_column(
        ForeignKey("astronauts.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    planet_id: Mapped[int | None] = mapped_column(
        ForeignKey("planets.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    awarded_by: Mapped[int] = mapped_column(
        ForeignKey("astronauts.id", ondelete="RESTRICT"), nullable=False
    )
    comment: Mapped[str | None] = mapped_column(Text)
    awarded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
