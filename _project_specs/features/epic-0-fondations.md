# EPIC 0 — Fondations techniques (P0)

## F-001 — Initialisation du monorepo

**Description:** Structure de base du monorepo avec pnpm workspaces et uv.

**Acceptance Criteria:**
- [ ] Dossiers `apps/api`, `apps/frontend`, `apps/backoffice`, `packages/shared-types` existent
- [ ] `pnpm workspaces` configuré (pnpm-workspace.yaml)
- [ ] `uv` configuré pour le backend (`pyproject.toml`)
- [ ] `.gitignore`, `.editorconfig`, `README.md` global présents
- [ ] `git clone` + commandes de démarrage documentées fonctionnent

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `pnpm install` à la racine | Toutes les dépendances installées |
| `uv sync` dans apps/api | Environnement Python créé |

---

## F-002 — Setup Docker & docker-compose

**Description:** Dockerfiles et docker-compose pour la stack complète.

**Acceptance Criteria:**
- [ ] Dockerfile pour `api`, `frontend`, `backoffice`
- [ ] `docker-compose.yml` avec services : `postgres`, `api`, `frontend`, `backoffice`
- [ ] Volumes persistants pour Postgres
- [ ] `.env.example` documenté
- [ ] `docker compose up` lance la stack complète, accessible localement

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `docker compose up` | Tous les services healthy |
| `GET http://localhost:8000/health` | 200 OK |
| `GET http://localhost:5173` | Frontend chargé |

---

## F-003 — Setup base de données & ORM

**Description:** PostgreSQL 16, SQLAlchemy async, Alembic, seed dev.

**Acceptance Criteria:**
- [ ] SQLAlchemy 2.x avec session async configurée
- [ ] Alembic initialisé avec première migration vide
- [ ] Script de seed pour dev (`seed.py`)
- [ ] `alembic upgrade head` fonctionne
- [ ] Modèle de base testable via pytest

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `alembic upgrade head` | Aucune erreur |
| `alembic downgrade -1` | Rollback propre |

---

## F-004 — Setup FastAPI & structure backend

**Description:** Application FastAPI avec architecture en couches complète.

**Acceptance Criteria:**
- [ ] Architecture : `models/`, `schemas/`, `repositories/`, `services/`, `api/v1/`
- [ ] Configuration via Pydantic Settings (`core/config.py`)
- [ ] Middleware CORS configuré
- [ ] Gestion d'erreurs centralisée (handlers custom)
- [ ] `GET /health` → 200
- [ ] `GET /api/v1/version` → version
- [ ] OpenAPI sur `/docs`

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `GET /health` | `{"status": "ok"}` |
| `GET /docs` | Schéma OpenAPI rendu |
| CORS depuis localhost:5173 | Headers CORS présents |

---

## F-005 — Setup React + Vite (front public)

**Description:** Application React frontend avec stack complète.

**Acceptance Criteria:**
- [ ] Vite + React 18 + TypeScript strict
- [ ] Tailwind CSS initialisé
- [ ] shadcn/ui initialisé
- [ ] React Router v6 configuré
- [ ] TanStack Query configuré
- [ ] Layout de base (header, footer, container)
- [ ] Hot reload fonctionnel

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `pnpm dev` | Accessible sur :5173 |
| Modification d'un fichier | Hot reload < 500ms |
| `pnpm tsc --noEmit` | Aucune erreur TS |

---

## F-006 — Setup React + Vite (back-office)

**Description:** Application React backoffice avec layout admin distinct.

**Acceptance Criteria:**
- [ ] Même stack que F-005
- [ ] Layout admin distinct (sidebar navigation, header)
- [ ] Port différent du frontend (ex: :5174)
- [ ] `pnpm dev` accessible

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `pnpm dev` | Accessible sur :5174 |
| Routes admin | Sidebar présente |

---

## F-007 — Génération des types depuis OpenAPI

**Description:** Script de génération des types TypeScript depuis le schéma FastAPI.

**Acceptance Criteria:**
- [ ] Script `pnpm generate:api` configuré à la racine
- [ ] Utilise `openapi-typescript` (ou `orval`)
- [ ] Sortie dans `packages/shared-types/`
- [ ] Importable depuis frontend ET backoffice
- [ ] Modifier un schéma Pydantic → régénère les types TS

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `pnpm generate:api` | Fichiers TS générés sans erreur |
| Ajout d'un champ Pydantic | Champ présent dans les types générés |
| `tsc --noEmit` après génération | Aucune erreur |

---

## F-008 — Setup CI GitHub Actions

**Description:** Pipeline CI complet avec lint, tests, build et coverage.

**Acceptance Criteria:**
- [ ] Workflow `ci.yml` : lint-backend, test-backend, lint-frontend, test-frontend, lint-backoffice, test-backoffice, build
- [ ] Service Postgres pour les tests d'intégration
- [ ] Cache `uv` et `pnpm`
- [ ] Badge coverage dans README
- [ ] PR bloquée si CI rouge

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| PR avec test cassé | CI rouge, merge bloqué |
| PR verte | Badge coverage mis à jour |

---

## F-009 — Setup linters & pre-commit

**Description:** Configuration complète des linters et hooks pre-commit.

**Acceptance Criteria:**
- [ ] `ruff check` + `ruff format` configurés
- [ ] `mypy --strict` configuré
- [ ] `eslint` + `prettier` configurés (frontend + backoffice)
- [ ] `tsc --noEmit` dans les scripts
- [ ] `.pre-commit-config.yaml` configuré
- [ ] Commit avec erreur lint rejeté

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `git commit` avec code non formaté | Rejeté par hook |
| `ruff check apps/api` | 0 erreur sur code propre |
| `mypy --strict apps/api/src` | 0 erreur |

---

## F-010 — Setup tests & coverage

**Description:** Configuration pytest, Vitest, MSW avec seuils de coverage.

**Acceptance Criteria:**
- [ ] pytest + pytest-cov + pytest-asyncio + httpx configurés
- [ ] Vitest + React Testing Library + MSW configurés
- [ ] Seuil 80% backend, 70% fronts
- [ ] CI échoue si seuil non atteint
- [ ] `pytest --cov` fonctionne
- [ ] `vitest run --coverage` fonctionne

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Coverage < seuil | CI échoue avec message clair |
| `pytest --cov=src` | Rapport coverage généré |
