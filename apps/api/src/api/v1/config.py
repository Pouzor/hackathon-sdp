"""Configuration globale — points d'ancienneté (F-206)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.deps import CurrentAdmin, CurrentAstronaut
from src.db.session import get_db
from src.models.seniority_config import SeniorityConfig
from src.schemas.config import SeniorityConfigOut, SeniorityConfigUpdate

router = APIRouter(prefix="/config", tags=["config"])


async def _get_config(db: AsyncSession) -> SeniorityConfig:
    result = await db.execute(select(SeniorityConfig))
    config = result.scalar_one_or_none()
    if config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration ancienneté introuvable.",
        )
    return config


@router.get("/seniority", response_model=SeniorityConfigOut)
async def get_seniority_config(
    _current: CurrentAstronaut,
    db: AsyncSession = Depends(get_db),
) -> SeniorityConfig:
    """Retourne la configuration des points d'ancienneté."""
    return await _get_config(db)


@router.put("/seniority", response_model=SeniorityConfigOut)
async def update_seniority_config(
    body: SeniorityConfigUpdate,
    _admin: CurrentAdmin,
    db: AsyncSession = Depends(get_db),
) -> SeniorityConfig:
    """Met à jour le nombre de points par année d'ancienneté (admin uniquement)."""
    config = await _get_config(db)
    config.points_per_year = body.points_per_year
    await db.commit()
    await db.refresh(config)
    return config
