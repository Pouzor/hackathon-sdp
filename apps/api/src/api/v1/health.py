from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness check — toujours 200 si l'app tourne."""
    return {"status": "ok"}


@router.get("/health/ready")
async def health_ready(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """Readiness check — 503 si la BDD est inaccessible."""
    await db.execute(text("SELECT 1"))
    return {"status": "ready"}
