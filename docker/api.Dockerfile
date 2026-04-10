FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first for cache efficiency
COPY apps/api/pyproject.toml .
RUN uv sync --no-dev

# Copy source
COPY apps/api/src ./src
COPY apps/api/alembic.ini .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
