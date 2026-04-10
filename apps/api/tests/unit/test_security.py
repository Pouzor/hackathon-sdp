"""Tests unitaires pour le service JWT."""
import time

import pytest
from jose import JWTError

from src.core.security import TokenPayload, create_access_token, decode_access_token, verify_token


def test_create_and_decode_token() -> None:
    data = {"sub": "1", "email": "test@eleven-labs.com", "astronaut_id": 1, "roles": ["astronaut"]}
    token = create_access_token(data)
    decoded = decode_access_token(token)
    assert decoded["email"] == "test@eleven-labs.com"
    assert decoded["astronaut_id"] == 1


def test_token_contains_expiry() -> None:
    token = create_access_token({"sub": "1", "email": "a@b.com", "astronaut_id": 1, "roles": []})
    decoded = decode_access_token(token)
    assert "exp" in decoded
    assert decoded["exp"] > time.time()


def test_invalid_token_raises() -> None:
    with pytest.raises(JWTError):
        decode_access_token("not-a-valid-token")


def test_tampered_token_raises() -> None:
    token = create_access_token({"sub": "1", "email": "a@b.com", "astronaut_id": 1, "roles": []})
    tampered = token[:-5] + "XXXXX"
    with pytest.raises(JWTError):
        decode_access_token(tampered)


def test_token_payload_is_admin() -> None:
    payload = TokenPayload({
        "sub": "1",
        "email": "admin@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut", "admin"],
    })
    assert payload.is_admin is True


def test_token_payload_not_admin() -> None:
    payload = TokenPayload({
        "sub": "1",
        "email": "user@eleven-labs.com",
        "astronaut_id": 1,
        "roles": ["astronaut"],
    })
    assert payload.is_admin is False


def test_verify_token_returns_payload() -> None:
    token = create_access_token({
        "sub": "42",
        "email": "x@eleven-labs.com",
        "astronaut_id": 42,
        "roles": ["astronaut"],
        "planet_id": 3,
    })
    payload = verify_token(token)
    assert payload.astronaut_id == 42
    assert payload.planet_id == 3
    assert payload.email == "x@eleven-labs.com"
