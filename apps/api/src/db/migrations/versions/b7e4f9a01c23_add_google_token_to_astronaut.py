"""add google_access_token and google_token_expires_at to astronauts (F-610)

Revision ID: b7e4f9a01c23
Revises: a3f1c2d8e905
Create Date: 2026-04-14 11:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

revision = "b7e4f9a01c23"
down_revision = "a3f1c2d8e905"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("astronauts", sa.Column("google_access_token", sa.Text(), nullable=True))
    op.add_column(
        "astronauts",
        sa.Column("google_token_expires_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("astronauts", "google_token_expires_at")
    op.drop_column("astronauts", "google_access_token")
