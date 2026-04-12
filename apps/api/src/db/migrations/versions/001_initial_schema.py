"""Initial schema — all tables

Revision ID: 001
Revises:
Create Date: 2026-04-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "planets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("mantra", sa.String(500), nullable=True),
        sa.Column("blason_url", sa.String(500), nullable=True),
        sa.Column("color_hex", sa.String(7), nullable=True),
        sa.Column("is_competing", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_default_for_newcomers", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "seasons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_seasons_is_active", "seasons", ["is_active"])

    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("base_points", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("is_collaborative", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("allow_multiple_assignees", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "grades",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("threshold_points", sa.Integer(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "seniority_config",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("points_per_year", sa.Integer(), nullable=False, server_default="50"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "astronauts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("hobbies", sa.String(1000), nullable=True),
        sa.Column("client", sa.String(255), nullable=True),
        sa.Column("hire_date", sa.Date(), nullable=True),
        sa.Column("planet_id", sa.Integer(), sa.ForeignKey("planets.id"), nullable=True),
        sa.Column(
            "roles",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("'{astronaut}'"),
        ),
        sa.Column("total_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_astronauts_email", "astronauts", ["email"])

    op.create_table(
        "season_planet_scores",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("planet_id", sa.Integer(), sa.ForeignKey("planets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("season_id", "planet_id", name="uq_season_planet"),
    )
    op.create_index("ix_season_planet_scores_season_id", "season_planet_scores", ["season_id"])

    op.create_table(
        "point_attributions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("astronaut_id", sa.Integer(), sa.ForeignKey("astronauts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("planet_id", sa.Integer(), sa.ForeignKey("planets.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("activity_id", sa.Integer(), sa.ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("awarded_by", sa.Integer(), sa.ForeignKey("astronauts.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("first_ever_multiplier_applied", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("first_season_bonus_applied", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_by", sa.Integer(), sa.ForeignKey("astronauts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("deletion_reason", sa.String(500), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "awarded_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_point_attributions_astronaut_id", "point_attributions", ["astronaut_id"])
    op.create_index("ix_point_attributions_planet_id", "point_attributions", ["planet_id"])
    op.create_index("ix_point_attributions_season_id", "point_attributions", ["season_id"])

    # Seed: seniority config par défaut
    op.execute("INSERT INTO seniority_config (points_per_year) VALUES (50)")


def downgrade() -> None:
    op.drop_table("point_attributions")
    op.drop_table("season_planet_scores")
    op.drop_table("astronauts")
    op.drop_table("seniority_config")
    op.drop_table("grades")
    op.drop_table("activities")
    op.drop_table("seasons")
    op.drop_table("planets")
