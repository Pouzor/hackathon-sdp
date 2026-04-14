from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class Trophy(Base):
    __tablename__ = "trophies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    icon_url: Mapped[str | None] = mapped_column(String(500))
    rule_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="manual"
    )  # "manual" | "automatic"
    rule_config: Mapped[str | None] = mapped_column(Text)  # JSON sérialisé
    season_id: Mapped[int | None] = mapped_column(
        ForeignKey("seasons.id", ondelete="SET NULL"), nullable=True, index=True
    )  # None = trophée multi-saisons
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
