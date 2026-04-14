import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path as _Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler  # type: ignore[import-untyped]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from src.api.v1.activities import router as activities_router
from src.api.v1.astronauts import router as astronauts_router
from src.api.v1.auth import router as auth_router
from src.api.v1.grades import router as grades_router
from src.api.v1.health import router as health_router
from src.api.v1.planets import router as planets_router
from src.api.v1.point_attributions import router as point_attributions_router
from src.api.v1.seasons import router as seasons_router
from src.api.v1.trophies import router as trophies_router
from src.api.v1.version import router as version_router
from src.core.config import settings
from src.core.errors import internal_error_handler, not_found_handler
from src.core.rate_limit import limiter
from src.services.seniority_cron import run_seniority_cron

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Démarrage du scheduler de points d'ancienneté (F-305)
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        run_seniority_cron,
        trigger="cron",
        hour=7,
        minute=0,
        id="seniority_cron",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler démarré — seniority_cron tous les jours à 07:00 UTC")

    yield

    scheduler.shutdown(wait=False)
    logger.info("Scheduler arrêté")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_exception_handler(404, not_found_handler)
app.add_exception_handler(500, internal_error_handler)

app.include_router(health_router)
app.include_router(version_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(planets_router, prefix="/api/v1")
app.include_router(astronauts_router, prefix="/api/v1")
app.include_router(seasons_router, prefix="/api/v1")
app.include_router(activities_router, prefix="/api/v1")
app.include_router(grades_router, prefix="/api/v1")
app.include_router(point_attributions_router, prefix="/api/v1")
app.include_router(trophies_router, prefix="/api/v1")

# Fichiers uploadés (avatars, etc.)
_Path(settings.upload_dir + "/avatars").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
