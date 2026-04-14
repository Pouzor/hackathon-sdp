from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class PointAttribution(Base):
    __tablename__ = "point_attributions"

    id: Mapped[int] = mapped_column(primary_key=True)
    astronaut_id: Mapped[int] = mapped_column(
        ForeignKey("astronauts.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    planet_id: Mapped[int] = mapped_column(
        ForeignKey("planets.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False
    )
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    awarded_by: Mapped[int | None] = mapped_column(
        ForeignKey("astronauts.id", ondelete="SET NULL"), nullable=True
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)

    # Modificateurs appliqués (tracabilité)
    first_ever_multiplier_applied: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    first_season_bonus_applied: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Soft delete pour audit
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deleted_by: Mapped[int | None] = mapped_column(ForeignKey("astronauts.id", ondelete="SET NULL"))
    deletion_reason: Mapped[str | None] = mapped_column(String(500))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    awarded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
