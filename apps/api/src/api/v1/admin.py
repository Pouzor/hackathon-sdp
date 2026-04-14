"""Routes d'administration système (F-610 — sync Google Workspace)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin
from src.db.session import get_db
from src.services.google_sync import SyncResult, sync_google_users

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post(
    "/sync-google-users",
    summary="Synchronise les utilisateurs Google Workspace",
    response_model=None,
)
async def sync_google_users_endpoint(
    admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
) -> SyncResult:
    """
    Déclenche la synchronisation depuis l'annuaire Google Workspace.
    - Requiert le rôle admin + Super Admin Google Workspace
    - Upsert des utilisateurs @eleven-labs.com (email comme clé)
    - Ignore les comptes suspendus
    - Retourne { created, updated, skipped }
    """
    return await sync_google_users(admin, db)
