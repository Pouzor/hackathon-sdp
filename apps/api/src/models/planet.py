from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class Planet(Base):
    __tablename__ = "planets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    mantra: Mapped[str | None] = mapped_column(String(500))
    blason_url: Mapped[str | None] = mapped_column(String(500))
    color_hex: Mapped[str | None] = mapped_column(String(7))  # ex: "#FF5733"
    is_competing: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_default_for_newcomers: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
