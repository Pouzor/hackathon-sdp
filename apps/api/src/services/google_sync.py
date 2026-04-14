"""Service de synchronisation Google Workspace → astronautes (F-610).

Appelle la Google Admin Directory API avec le token de l'admin connecté.
Prérequis GCP :
  - Admin SDK API activée dans Google Cloud Console
  - Scope admin.directory.user.readonly ajouté à l'app OAuth
  - Le compte qui déclenche la synchro doit être Super Admin Google Workspace
"""

import logging
from datetime import UTC, datetime
from typing import TypedDict

import httpx
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.astronaut import Astronaut
from src.repositories.astronaut import AstronautRepository

logger = logging.getLogger(__name__)

_DIRECTORY_API_URL = (
    "https://admin.googleapis.com/admin/directory/v1/users"
    "?domain=eleven-labs.com&maxResults=500&projection=basic"
)


class SyncResult(TypedDict):
    created: int
    updated: int
    skipped: int


async def sync_google_users(admin: Astronaut, db: AsyncSession) -> SyncResult:
    """Synchronise les utilisateurs Google Workspace vers la table astronauts.

    - Upsert sur l'email (clé naturelle)
    - Utilisateurs suspendus ignorés
    - awarded_by = None (opération système déclenchée par admin)
    """
    # Vérification du token stocké
    if not admin.google_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Reconnectez-vous pour synchroniser (token Google absent)",
        )
    if (
        admin.google_token_expires_at is not None
        and admin.google_token_expires_at < datetime.now(UTC)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Reconnectez-vous pour synchroniser (token Google expiré)",
        )

    # Appel Directory API
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            _DIRECTORY_API_URL,
            headers={"Authorization": f"Bearer {admin.google_access_token}"},
        )

    if response.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Reconnectez-vous pour synchroniser (token Google rejeté)",
        )
    if response.status_code == 403:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Accès refusé par la Directory API. "
                "Le compte doit être Super Admin Google Workspace."
            ),
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erreur Directory API : {response.status_code}",
        )

    data = response.json()
    users: list[dict[str, object]] = data.get("users", [])

    repo = AstronautRepository(db)
    created = 0
    updated = 0
    skipped = 0

    for user in users:
        # Ignorer les comptes suspendus
        if user.get("suspended"):
            skipped += 1
            continue

        email = str(user.get("primaryEmail", ""))
        if not email:
            skipped += 1
            continue

        name: dict[str, object] = user.get("name", {})  # type: ignore[assignment]
        first_name = str(name.get("givenName", ""))
        last_name = str(name.get("familyName", ""))
        photo_url: str | None = user.get("thumbnailPhotoUrl")  # type: ignore[assignment]

        existing = await repo.get_by_email(email)
        if existing is None:
            await repo.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                photo_url=photo_url,
            )
            logger.info("google_sync: créé %s", email)
            created += 1
        else:
            update_fields: dict[str, object] = {
                "first_name": first_name,
                "last_name": last_name,
            }
            # Ne pas écraser une photo uploadée manuellement par une thumbnail Google vide
            if photo_url:
                update_fields["photo_url"] = photo_url
            await repo.update_profile(existing, update_fields)
            updated += 1

    await db.commit()
    logger.info(
        "google_sync: terminé — %d créé(s), %d mis à jour, %d ignoré(s)",
        created,
        updated,
        skipped,
    )
    return SyncResult(created=created, updated=updated, skipped=skipped)
