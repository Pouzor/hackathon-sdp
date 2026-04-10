# CLAUDE.md — Site des Planètes Eleven Labs

> Document de cadrage et conventions pour Claude Code.
> À lire **systématiquement** avant toute génération de code sur ce projet.

---

## 0. Skills

Lire et suivre ces skills avant d'écrire du code :

- `.claude/skills/base/SKILL.md`
- `.claude/skills/security/SKILL.md`
- `.claude/skills/project-tooling/SKILL.md`
- `.claude/skills/session-management/SKILL.md`
- `.claude/skills/python/SKILL.md`
- `.claude/skills/typescript/SKILL.md`
- `.claude/skills/react-web/SKILL.md`
- `.claude/skills/playwright-testing/SKILL.md`
- `.claude/skills/agent-teams/SKILL.md`

## Agent Teams (Workflow par défaut)

Ce projet utilise Claude Code Agent Teams. Chaque feature est implémentée par un agent dédié suivant un pipeline TDD strict.

### Pipeline (par feature)
Spec > Spec Review > Tests > RED Verify > Implement > GREEN Verify > Validate > Code Review > Security > Branch+PR

### Agents
- **Team Lead** : Orchestration uniquement, ne code jamais
- **Quality Agent** : Vérifie RED/GREEN, coverage ≥ 80% (back) / 70% (front)
- **Security Agent** : OWASP, secrets, dépendances
- **Code Review Agent** : Revue multi-moteurs
- **Merger Agent** : Branches et PRs via `gh`
- **Feature Agents** : Un par feature

### Commandes
- `/spawn-team` — Déployer l'équipe d'agents

### Environnement requis
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

---

## 1. Contexte du projet

Le **Site des Planètes** est l'outil de gamification de la vie interne d'Eleven Labs. Chaque salarié ("astronaute") est rattaché à une planète et gagne des points individuels et collectifs en participant à des challenges, événements, et contributions à l'intelligence collective.

- **Saison** : de septembre à septembre. Les points planète sont reset à chaque nouvelle saison ; les points individuels et l'historique sont conservés à vie.
- **6 planètes** : 4 principales en compétition + 1 pour les nouveaux arrivants (avant attribution) + 1 pour les arbitres (hors compétition).
- **Objectifs produit** : visualiser le classement en temps réel, consulter l'historique des contributions, gérer la compétition via un back-office.

---

## 2. Architecture générale

Architecture **headless** en monorepo avec trois applications :

```
planets/
├── apps/
│   ├── api/              # Backend FastAPI (Python)
│   ├── frontend/         # Front public (React + Vite) — trombinoscope, profils, planètes
│   └── backoffice/       # Back-office admin (React + Vite)
├── packages/
│   └── shared-types/     # Types TypeScript partagés (générés depuis OpenAPI)
├── docker/               # Dockerfiles + docker-compose
├── .github/workflows/    # CI GitHub Actions
├── CLAUDE.md
├── FEATURES.md
└── README.md
```

### Stack technique

| Couche       | Choix                                           |
| ------------ | ----------------------------------------------- |
| Backend      | **FastAPI** (Python 3.12+)                      |
| ORM          | **SQLAlchemy 2.x** + **Alembic** (migrations)   |
| Validation   | **Pydantic v2**                                 |
| BDD          | **PostgreSQL 16**                               |
| Auth         | **Google OAuth 2.0** (restreint `@eleven-labs.com`) + JWT |
| Deps Python  | **uv**                                          |
| Frontends    | **React 18 + Vite + TypeScript (strict)**       |
| UI Library   | **shadcn/ui** + **Tailwind CSS**                |
| State / Data | **TanStack Query** (React Query) + **Zustand** si besoin état global |
| Routing      | **React Router v6**                             |
| Forms        | **React Hook Form** + **Zod**                   |
| HTTP client  | **Axios** ou `fetch` + client généré OpenAPI    |
| Tests Python | **pytest** + **pytest-cov** + **pytest-asyncio** |
| Tests JS     | **Vitest** + **React Testing Library** + **Playwright** (E2E) |
| Lint Python  | **ruff** + **mypy** (strict)                    |
| Lint JS      | **ESLint** + **Prettier** + **TypeScript strict** |
| CI           | **GitHub Actions**                              |
| Conteneurs   | **Docker + docker-compose**                     |
| Webhooks     | Sortants vers Slack (via httpx async)           |

### Communication entre apps

- L'API expose un schéma **OpenAPI 3** automatiquement généré par FastAPI.
- Les types TypeScript front sont **générés depuis l'OpenAPI** (via `openapi-typescript` ou `orval`) et stockés dans `packages/shared-types`.
- **Aucun type API ne doit être écrit à la main côté front.**

---

## 3. Conventions de code

### Python (backend)

- **Python 3.12+**, typage strict obligatoire (annotations sur toutes les signatures).
- **`ruff`** pour le linting et le formatage (remplace black/isort/flake8).
- **`mypy --strict`** doit passer sans erreur.
- Architecture en couches :
  ```
  apps/api/src/
  ├── main.py              # Entrypoint FastAPI
  ├── core/                # Config, sécurité, dépendances communes
  ├── db/                  # Session, base, migrations
  ├── models/              # Modèles SQLAlchemy
  ├── schemas/             # Schémas Pydantic (DTO)
  ├── repositories/        # Accès données (1 fichier par agrégat)
  ├── services/            # Logique métier
  ├── api/                 # Routes FastAPI (1 router par ressource)
  │   └── v1/
  └── webhooks/            # Émission webhooks Slack
  ```
- **Pas de logique métier dans les routes** : routes → services → repositories.
- **Injection de dépendances** via `Depends()` FastAPI.
- Toutes les routes sont **versionnées** (`/api/v1/...`).
- Nommage : `snake_case` pour fichiers, fonctions, variables ; `PascalCase` pour classes.
- Docstrings en **français** (le projet est interne FR), code et identifiants en **anglais**.

### TypeScript / React (frontends)

- **TypeScript strict** (`"strict": true`, `"noUncheckedIndexedAccess": true`).
- Composants **fonctionnels uniquement**, pas de classes.
- Structure type :
  ```
  apps/frontend/src/
  ├── main.tsx
  ├── App.tsx
  ├── routes/              # Pages (1 dossier par route)
  ├── components/
  │   ├── ui/              # Primitives shadcn
  │   └── features/        # Composants métier
  ├── hooks/               # Hooks custom (useXxx)
  ├── lib/                 # Utils, client API, helpers
  ├── api/                 # Client API généré + wrappers React Query
  ├── stores/              # Stores Zustand (si besoin)
  └── types/               # Types locaux (les types API sont importés)
  ```
- **Un composant = un fichier**, nommé en `PascalCase.tsx`.
- Pas de CSS inline ; tout passe par **Tailwind**.
- Utiliser **React Query** pour toute donnée serveur (jamais `useEffect + fetch` à la main).
- **Pas de `any`** ; si vraiment nécessaire, justifier en commentaire et préférer `unknown`.
- Imports ordonnés : React → libs externes → alias internes (`@/...`) → relatifs.

### Git

- Branches : `main` (protégée) + `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Commits : **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- PRs obligatoires vers `main`, **pas de push direct**.
- Squash merge par défaut.

---

## 4. Qualité, tests, CI

### Couverture de code (NON NÉGOCIABLE)

| App         | Seuil minimum |
| ----------- | ------------- |
| Backend API | **80 %**      |
| Frontend    | **70 %**      |
| Backoffice  | **70 %**      |

La CI **fait échouer** la PR si le seuil n'est pas atteint.

### Tests

- **Backend** :
  - Tests unitaires sur les services (mock des repositories).
  - Tests d'intégration sur les routes via `httpx.AsyncClient` + une BDD Postgres jetable (testcontainers ou service GitHub Actions).
  - Fixtures pytest pour les données de seed.
  - Tests des règles métier critiques : attribution de points, calcul de grade, reset de saison, multiplicateur "1ère contribution ever", déclenchement automatique de trophées.
- **Frontend** :
  - Tests unitaires composants avec Vitest + RTL.
  - Tests des hooks custom.
  - Mock du client API via MSW (Mock Service Worker).
- **E2E** :
  - Playwright sur les parcours critiques (login Google mocké, consultation profil, attribution de points via back-office).

### Lint & type-check

Avant chaque commit (via **pre-commit hooks**) et en CI :

- Backend : `ruff check`, `ruff format --check`, `mypy --strict`
- Frontend : `eslint`, `prettier --check`, `tsc --noEmit`

### Pipeline GitHub Actions

Workflows obligatoires dans `.github/workflows/` :

1. **`ci.yml`** déclenché sur PR et push `main` :
   - `lint-backend` : ruff + mypy
   - `test-backend` : pytest + coverage (échoue si < 80%)
   - `lint-frontend` : eslint + prettier + tsc
   - `test-frontend` : vitest + coverage (échoue si < 70%)
   - `lint-backoffice` : idem
   - `test-backoffice` : idem
   - `build` : build Docker des trois apps
2. **`e2e.yml`** : Playwright sur `docker-compose` complet (déclenché sur PR).
3. **`migrations.yml`** : vérifie que les migrations Alembic sont à jour vs les modèles.

Toutes les étapes doivent passer pour merger.

---

## 5. Sécurité & authentification

- **Google OAuth 2.0** restreint au domaine `@eleven-labs.com` (vérification du `hd` claim côté backend).
- Le backend émet un **JWT** signé (HS256 ou RS256) après validation Google, avec claims : `sub`, `email`, `astronaut_id`, `roles`, `planet_id`, `exp`.
- **Rôles applicatifs** :
  - `astronaut` : utilisateur standard (par défaut).
  - `admin` : accès au back-office, attribué via le back-office par un autre admin.
- L'attribution à une **planète** est une donnée métier portée par l'astronaute, distincte des rôles applicatifs.
- **Rate limiting** sur les endpoints sensibles (login, webhooks).
- **CORS** restreint aux origines des deux fronts.
- Secrets via variables d'environnement, **jamais committés**. Fournir un `.env.example`.
- Validation Pydantic systématique sur toutes les entrées.
- Pas de SQL brut sauf cas exceptionnel justifié ; passer par SQLAlchemy.

---

## 6. Modèle de données (vue d'ensemble)

Entités principales (à raffiner dans les schémas réels) :

- **Astronaut** : id, email, first_name, last_name, photo_url, hobbies, client, hire_date, planet_id, roles, total_points
- **Planet** : id, name, mantra, blason_url, color_hex, is_competing, is_default_for_newcomers
- **Season** : id, name, start_date, end_date, is_active
- **Activity** : id, name, base_points, category, is_collaborative, allow_multiple_assignees
- **PointAttribution** : id, astronaut_id, planet_id, activity_id, season_id, points, awarded_at, awarded_by, comment
- **Trophy** : id, name, description, icon_url, rule_type (`manual` | `automatic`), rule_config (JSON), season_id (nullable)
- **TrophyAttribution** : id, trophy_id, astronaut_id (nullable), planet_id (nullable), season_id, awarded_at
- **Grade** : id, name, threshold_points, order (configurable via back-office)
- **SeniorityConfig** : points_per_year (configurable via back-office)
- **Event** : id, name, date — pour la sélection de participants sans points

> Les grades, paliers, et valeurs de points doivent être **configurables via le back-office**, pas codés en dur.

---

## 7. Identité graphique — À DEMANDER À L'UTILISATEUR

⚠️ **Avant tout développement frontend**, Claude Code doit demander à l'utilisateur :

1. Les **blasons** des 6 planètes (fichiers SVG/PNG).
2. Le **code couleur** de chaque planète (hex).
3. Le **logo Eleven Labs** et la charte graphique (typographie, couleurs principales).
4. Les **mantras** ou descriptifs de chaque planète si disponibles.
5. Toute **maquette** ou wireframe existant.

**Ne pas inventer d'identité visuelle.** Utiliser des placeholders neutres en attendant les assets.

---

## 8. Webhooks Slack

- Configurés via le back-office (URL du webhook par type d'événement).
- Émis en **asynchrone** (via `BackgroundTasks` FastAPI ou une queue) pour ne pas bloquer la réponse API.
- Événements émis : attribution de points, attribution de trophée, passage de grade, début/fin de saison.
- Échec d'émission **non bloquant** mais loggé.
- Priorité **P2** (post-MVP).

---

## 9. Workflow de développement avec Claude Code

Quand on demande à Claude Code de développer une fonctionnalité :

1. **Lire** `CLAUDE.md` (ce fichier) et `FEATURES.md`.
2. **Identifier** la feature dans `FEATURES.md` et sa priorité.
3. **Vérifier** les dépendances avec d'autres features.
4. **Proposer** un plan d'implémentation avant de coder.
5. **Écrire les tests d'abord** (TDD encouragé) sur les règles métier critiques.
6. **Implémenter** en respectant l'architecture en couches.
7. **Vérifier** : lint, type-check, tests, coverage.
8. **Mettre à jour** la doc si l'API change.
9. **Demander les assets graphiques** si on touche au front et qu'ils manquent.

### Règles strictes

- ❌ **Ne jamais** désactiver un test pour faire passer la CI.
- ❌ **Ne jamais** baisser le seuil de coverage.
- ❌ **Ne jamais** committer de secrets.
- ❌ **Ne jamais** introduire de logique métier dans les routes.
- ❌ **Ne jamais** dupliquer les types entre front et back (utiliser les types générés).
- ✅ **Toujours** ajouter une migration Alembic quand un modèle change.
- ✅ **Toujours** ajouter/mettre à jour les tests avec le code.
- ✅ **Toujours** privilégier la lisibilité à la cleverness.

---

## 10. Démarrage local

```bash
# Démarrer la stack complète
docker compose up -d

# Backend seul
cd apps/api
uv sync
uv run alembic upgrade head
uv run uvicorn src.main:app --reload

# Frontend
cd apps/frontend
pnpm install
pnpm dev

# Tests backend
cd apps/api && uv run python -m pytest --cov

# Tests frontend
cd apps/frontend && pnpm test
```

---

## 10b. Environnement Python — règles impératives

### Pourquoi `uv run python -m pytest` et pas `uv run pytest`

`uv run pytest` peut résoudre le binaire `pytest` depuis le PATH système (Homebrew, pyenv, etc.)
au lieu du venv géré par uv. **Toujours utiliser `python -m pytest`** pour garantir l'isolation.

### Procédure complète pour lancer les tests backend

```bash
cd apps/api

# 1. Créer / mettre à jour le venv (à faire après chaque changement de pyproject.toml)
uv sync

# 2. Copier et remplir le .env si ce n'est pas déjà fait
cp ../../.env.example .env
# Éditer .env avec les vraies valeurs

# 3. Charger les variables d'environnement dans le shell courant
source .env

# 4. Lancer les tests avec le Python du venv
uv run python -m pytest

# Avec coverage :
uv run python -m pytest --cov=src --cov-report=term-missing

# Un fichier spécifique :
uv run python -m pytest tests/unit/test_security.py -v
```

### Alternative : activer le venv manuellement

```bash
cd apps/api
source .venv/bin/activate   # active le venv uv
source ../../.env           # charge les variables d'environnement

pytest --cov=src            # pytest du venv, .env chargé
mypy --strict src/          # idem

deactivate                  # quitter le venv
```

### Variables d'environnement en tests

- Les tests **unitaires** (mocks complets) n'ont pas besoin du `.env`.
- Les tests **d'intégration** avec BDD réelle nécessitent `DATABASE_URL`.
- Ne jamais hardcoder de valeurs de secrets dans les fixtures de test.
- Utiliser `pytest-dotenv` ou `source .env` avant de lancer la suite d'intégration.

### Règle stricte

❌ **Ne jamais** utiliser `uv run pytest` directement — risque de prendre le pytest système.
✅ **Toujours** utiliser `uv run python -m pytest` ou activer le venv avec `source .venv/bin/activate`.

---

## 11. Définition de "Done"

Une feature est considérée comme terminée si :

- ✅ Le code respecte toutes les conventions du présent document.
- ✅ Les tests sont écrits et passent.
- ✅ Le coverage est respecté (80% back / 70% front).
- ✅ Lint et type-check passent sans warning.
- ✅ La CI est verte sur la PR.
- ✅ Une migration Alembic est fournie si le schéma BDD change.
- ✅ La documentation OpenAPI est à jour (automatique via FastAPI).
- ✅ Les assets graphiques nécessaires ont été fournis et intégrés.
- ✅ Une revue de PR a été faite.
