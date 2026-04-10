from fastapi import APIRouter

from src.core.config import settings

router = APIRouter(tags=["version"])


@router.get("/version")
async def version() -> dict[str, str]:
    return {"version": settings.app_version, "name": settings.app_name}
