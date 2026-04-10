from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class SeniorityConfig(Base):
    """Table à une seule ligne — configuration globale des points d'ancienneté."""

    __tablename__ = "seniority_config"

    id: Mapped[int] = mapped_column(primary_key=True)
    points_per_year: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
