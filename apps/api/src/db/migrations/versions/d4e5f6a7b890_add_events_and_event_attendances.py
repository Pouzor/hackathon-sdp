"""add events and event_attendances tables (F-609)

Revision ID: d4e5f6a7b890
Revises: b7e4f9a01c23
Create Date: 2026-04-14 12:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

revision = "d4e5f6a7b890"
down_revision = "b7e4f9a01c23"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column(
            "created_by",
            sa.Integer(),
            sa.ForeignKey("astronauts.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_table(
        "event_attendances",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "event_id",
            sa.Integer(),
            sa.ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "astronaut_id",
            sa.Integer(),
            sa.ForeignKey("astronauts.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    # Contrainte unicité : un astronaute ne peut être enregistré qu'une fois par événement
    op.create_unique_constraint(
        "uq_event_attendance", "event_attendances", ["event_id", "astronaut_id"]
    )


def downgrade() -> None:
    op.drop_table("event_attendances")
    op.drop_table("events")
