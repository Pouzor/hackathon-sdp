from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.errors import internal_error_handler, not_found_handler
from src.api.v1.activities import router as activities_router
from src.api.v1.astronauts import router as astronauts_router
from src.api.v1.auth import router as auth_router
from src.api.v1.grades import router as grades_router
from src.api.v1.health import router as health_router
from src.api.v1.planets import router as planets_router
from src.api.v1.point_attributions import router as point_attributions_router
from src.api.v1.seasons import router as seasons_router
from src.api.v1.version import router as version_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(404, not_found_handler)  # type: ignore[arg-type]
app.add_exception_handler(500, internal_error_handler)  # type: ignore[arg-type]

app.include_router(health_router)
app.include_router(version_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(planets_router, prefix="/api/v1")
app.include_router(astronauts_router, prefix="/api/v1")
app.include_router(seasons_router, prefix="/api/v1")
app.include_router(activities_router, prefix="/api/v1")
app.include_router(grades_router, prefix="/api/v1")
app.include_router(point_attributions_router, prefix="/api/v1")
