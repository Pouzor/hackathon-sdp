"""Tests unitaires pour les dépendances FastAPI."""
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException
from jose import JWTError

from src.core.deps import get_current_token
from src.core.security import create_access_token


async def test_get_current_token_missing_credentials() -> None:
    """Sans credentials, lève 401."""
    with pytest.raises(HTTPException) as exc:
        await get_current_token(None)
    assert exc.value.status_code == 401
    assert "manquant" in exc.value.detail


async def test_get_current_token_invalid_token() -> None:
    """Token invalide → 401."""
    credentials = MagicMock()
    credentials.credentials = "invalid.token.here"
    with pytest.raises(HTTPException) as exc:
        await get_current_token(credentials)
    assert exc.value.status_code == 401


async def test_get_current_token_valid() -> None:
    """Token valide → payload retourné."""
    token = create_access_token({
        "sub": "1",
        "email": "x@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut"],
    })
    credentials = MagicMock()
    credentials.credentials = token
    payload = await get_current_token(credentials)
    assert payload.astronaut_id == 1
