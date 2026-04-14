"""nullable awarded_by on point_attributions (system cron)

Revision ID: a3f1c2d8e905
Revises: 5188b4636b70
Create Date: 2026-04-14 10:00:00.000000

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "a3f1c2d8e905"
down_revision = "5188b4636b70"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rendre awarded_by nullable (attributions système sans auteur humain)
    op.alter_column("point_attributions", "awarded_by", nullable=True)
    # Changer la contrainte FK ondelete RESTRICT → SET NULL
    op.drop_constraint(
        "point_attributions_awarded_by_fkey", "point_attributions", type_="foreignkey"
    )
    op.create_foreign_key(
        "point_attributions_awarded_by_fkey",
        "point_attributions",
        "astronauts",
        ["awarded_by"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "point_attributions_awarded_by_fkey", "point_attributions", type_="foreignkey"
    )
    op.create_foreign_key(
        "point_attributions_awarded_by_fkey",
        "point_attributions",
        "astronauts",
        ["awarded_by"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.alter_column("point_attributions", "awarded_by", nullable=False)
