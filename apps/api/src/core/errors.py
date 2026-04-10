from fastapi import Request
from fastapi.responses import JSONResponse


async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "Ressource introuvable"})


async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Erreur interne du serveur"})
