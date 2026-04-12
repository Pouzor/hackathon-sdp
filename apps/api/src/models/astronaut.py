from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class Astronaut(Base):
    __tablename__ = "astronauts"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    hobbies: Mapped[str | None] = mapped_column(String(1000))
    client: Mapped[str | None] = mapped_column(String(255))
    hire_date: Mapped[date | None] = mapped_column(Date)
    planet_id: Mapped[int | None] = mapped_column(nullable=True)
    roles: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=["astronaut"])
    total_points: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
