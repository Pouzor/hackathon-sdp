from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.errors import internal_error_handler, not_found_handler
from src.api.v1.health import router as health_router
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
