# Site des Planètes — Eleven Labs

Outil de gamification interne Eleven Labs. Chaque salarié est rattaché à une planète et gagne des points en participant à des challenges, événements et contributions.

## Architecture

Monorepo avec trois applications :

```
planets/
├── apps/
│   ├── api/              # Backend FastAPI (Python 3.12+)
│   ├── frontend/         # Front public (React + Vite)
│   └── backoffice/       # Back-office admin (React + Vite)
├── packages/
│   └── shared-types/     # Types TypeScript générés depuis OpenAPI
├── docker/
├── .github/workflows/
└── docker-compose.yml
```

## Démarrage rapide

### Stack complète (recommandé)

```bash
cp .env.example .env
# Remplir les valeurs dans .env
docker compose up -d
```

- Frontend : http://localhost:5173
- Backoffice : http://localhost:5174
- API : http://localhost:8000
- Docs API : http://localhost:8000/docs

### Développement local

```bash
# Backend
cd apps/api
cp ../../.env.example .env   # puis remplir les valeurs
uv sync
uv run alembic upgrade head
PYTHONPATH=. uv run python scripts/seed.py --reset   # fixtures de dev
uv run uvicorn src.main:app --reload

# Frontend
cd apps/frontend
pnpm install
pnpm dev

# Backoffice
cd apps/backoffice
pnpm install
pnpm dev
```

### Générer les types TypeScript depuis l'API

```bash
# L'API doit tourner sur :8000
pnpm generate:api
```

## Tests

```bash
# Backend (depuis apps/api)
uv run pytest --cov=src

# Frontend (depuis apps/frontend)
pnpm test

# E2E (stack docker requise)
cd e2e && pnpm test
```

## Vérification de l'outillage

```bash
./scripts/verify-tooling.sh
```

## Conventions

Voir [CLAUDE.md](./CLAUDE.md) pour les conventions de code, l'architecture et les règles strictes.

## Features

Voir [FEATURES.md](./FEATURES.md) pour le backlog complet organisé par priorité.
