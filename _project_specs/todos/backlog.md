# Backlog

Priorités : P0 (fondations) → P1 (MVP) → P2 (enrichissement) → P3 (polish).
Move to active.md when starting. Référence : `_project_specs/features/`.

---

## P0 — Fondations & Auth (bloquant)

- [ ] **F-001** Initialisation du monorepo (pnpm workspaces + uv)
  → `_project_specs/features/epic-0-fondations.md#f-001`
- [ ] **F-002** Setup Docker & docker-compose (postgres + 3 apps)
  → `_project_specs/features/epic-0-fondations.md#f-002`
- [ ] **F-003** Setup PostgreSQL + SQLAlchemy async + Alembic
  → `_project_specs/features/epic-0-fondations.md#f-003`
- [ ] **F-004** Setup FastAPI + architecture en couches (/health, /docs)
  → `_project_specs/features/epic-0-fondations.md#f-004`
- [ ] **F-005** Setup React + Vite frontend public (Tailwind, shadcn, Router, Query)
  → `_project_specs/features/epic-0-fondations.md#f-005`
- [ ] **F-006** Setup React + Vite backoffice (layout admin)
  → `_project_specs/features/epic-0-fondations.md#f-006`
- [ ] **F-007** Génération types TypeScript depuis OpenAPI (pnpm generate:api)
  → `_project_specs/features/epic-0-fondations.md#f-007`
- [ ] **F-008** Setup CI GitHub Actions (lint + test + build + coverage)
  → `_project_specs/features/epic-0-fondations.md#f-008`
- [ ] **F-009** Setup linters & pre-commit (ruff, mypy, eslint, prettier)
  → `_project_specs/features/epic-0-fondations.md#f-009`
- [ ] **F-010** Setup tests & coverage (pytest, vitest, MSW, seuils 80%/70%)
  → `_project_specs/features/epic-0-fondations.md#f-010`
- [ ] **F-101** Authentification Google OAuth 2.0 (restreint @eleven-labs.com + JWT)
  → `_project_specs/features/epic-1-auth.md#f-101`
- [ ] **F-102** Gestion sessions front (useAuth, ProtectedRoute, logout)
  → `_project_specs/features/epic-1-auth.md#f-102`

---

## P1 — MVP fonctionnel

### Epic 1 — Auth (suite)
- [ ] **F-103** Système de rôles (astronaut / admin, require_admin)
  → `_project_specs/features/epic-1-auth.md#f-103`
- [ ] **F-104** Attribution admin via back-office
  → `_project_specs/features/epic-1-auth.md#f-104`

### Epic 2 — Modèle métier
- [ ] **F-201** Modèle Planet (CRUD + seed 6 planètes)
  → `_project_specs/features/epic-2-modele-metier.md#f-201`
- [ ] **F-202** Modèle Astronaut (CRUD + édition profil propre)
  → `_project_specs/features/epic-2-modele-metier.md#f-202`
- [ ] **F-203** Modèle Season (activation, clôture, reset)
  → `_project_specs/features/epic-2-modele-metier.md#f-203`
- [ ] **F-204** Modèle Activity (CRUD + seed catalogue)
  → `_project_specs/features/epic-2-modele-metier.md#f-204`
- [ ] **F-205** Modèle Grade (seed 14 grades + calcul courant)
  → `_project_specs/features/epic-2-modele-metier.md#f-205`
- [ ] **F-206** Configuration ancienneté (points_per_year)
  → `_project_specs/features/epic-2-modele-metier.md#f-206`

### Epic 3 — Attribution de points
- [ ] **F-301** Attribution de points (POST /point-attributions)
  → `_project_specs/features/epic-3-points.md#f-301`
- [ ] **F-302** Attribution co-auteurs (multi-assignation)
  → `_project_specs/features/epic-3-points.md#f-302`
- [ ] **F-303** Multiplicateur 1ère contribution ever (×2)
  → `_project_specs/features/epic-3-points.md#f-303`
- [ ] **F-304** Bonus 1ère contribution de la saison (+25 pts)
  → `_project_specs/features/epic-3-points.md#f-304`
- [ ] **F-305** Calcul automatique points ancienneté
  → `_project_specs/features/epic-3-points.md#f-305`
- [ ] **F-306** Suppression / correction d'une attribution (admin + audit)
  → `_project_specs/features/epic-3-points.md#f-306`

### Epic 4 — Trophées (P1)
- [ ] **F-401** Trophées manuels (CRUD + attribution astronaute/planète)
  → `_project_specs/features/epic-4-trophees.md#f-401`
- [ ] **F-403** Affichage trophées sur fiche astronaute
  → `_project_specs/features/epic-4-trophees.md#f-403`
- [ ] **F-404** Historique trophées planète
  → `_project_specs/features/epic-4-trophees.md#f-404`

### Epic 5 — Front public
⚠️ Demander assets graphiques avant de commencer
- [ ] **F-501** Page trombinoscope (grille, recherche, filtre planète)
  → `_project_specs/features/epic-5-front-public.md#f-501`
- [ ] **F-502** Page profil astronaute (infos, points, grade, historique, trophées)
  → `_project_specs/features/epic-5-front-public.md#f-502`
- [ ] **F-503** Édition de son propre profil (photo, hobbies, client)
  → `_project_specs/features/epic-5-front-public.md#f-503`
- [ ] **F-504** Page détail planète (header, membres, trophées, timeline)
  → `_project_specs/features/epic-5-front-public.md#f-504`
- [ ] **F-505** Page classement / scoreboard (4 planètes, polling 30s)
  → `_project_specs/features/epic-5-front-public.md#f-505`

### Epic 6 — Back-office
⚠️ Demander assets graphiques avant de commencer
- [ ] **F-601** Dashboard admin (métriques, dernières attributions)
  → `_project_specs/features/epic-6-backoffice.md#f-601`
- [ ] **F-602** Gestion des planètes (CRUD + upload blason)
  → `_project_specs/features/epic-6-backoffice.md#f-602`
- [ ] **F-603** Gestion des astronautes (CRUD + réaffectation)
  → `_project_specs/features/epic-6-backoffice.md#f-603`
- [ ] **F-604** Gestion des saisons (activation, clôture)
  → `_project_specs/features/epic-6-backoffice.md#f-604`
- [ ] **F-605** Gestion des grades & paliers
  → `_project_specs/features/epic-6-backoffice.md#f-605`
- [ ] **F-606** Gestion des activités (CRUD catalogue)
  → `_project_specs/features/epic-6-backoffice.md#f-606`
- [ ] **F-607** Attribution de points UI (formulaire complet)
  → `_project_specs/features/epic-6-backoffice.md#f-607`
- [ ] **F-608** Gestion des trophées (CRUD + attribution manuelle)
  → `_project_specs/features/epic-6-backoffice.md#f-608`
- [ ] **F-609** Interface présence aux events (sans points)
  → `_project_specs/features/epic-6-backoffice.md#f-609`

---

## P2 — Enrichissement

- [ ] **F-402** Trophées automatiques par règles JSON
- [ ] **F-701** Configuration webhooks Slack (CRUD URLs)
- [ ] **F-702** Webhook attribution de points → Slack
- [ ] **F-703** Webhook trophée → Slack
- [ ] **F-704** Webhook passage de grade → Slack
- [ ] **F-801** Logging structuré JSON
- [ ] **F-802** Healthchecks avancés (/health/live + /health/ready)
- [ ] **F-803** Audit log consultable en back-office

---

## P3 — Polish

- [ ] **F-901** Responsive mobile
- [ ] **F-902** Accessibilité WCAG AA (axe-core)
- [ ] **F-903** Mode sombre
- [ ] **F-904** Notifications in-app (toasts)
- [ ] **F-905** Export CSV
