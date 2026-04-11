# FEATURES.md — Site des Planètes Eleven Labs

> Découpage fonctionnel du projet, organisé par épopées (epics) et priorités techniques.
> À utiliser comme backlog de référence pour Claude Code.

---

## Légende

- **P0** : Fondations techniques. Bloque tout le reste.
- **P1** : MVP fonctionnel. L'application est utilisable de bout en bout.
- **P2** : Enrichissement. Améliore l'expérience et complète le périmètre.
- **P3** : Confort & nice-to-have.

Chaque feature a un **ID stable** (`F-XXX`) pour pouvoir la référencer.

---

## EPIC 0 — Fondations techniques (P0)

### F-001 — Initialisation du monorepo
- Structure `apps/api`, `apps/frontend`, `apps/backoffice`, `packages/shared-types`
- Configuration `pnpm workspaces` (ou équivalent) pour les fronts
- Configuration `uv` pour le backend
- `.gitignore`, `.editorconfig`, `README.md` global
- **Critères d'acceptation** : `git clone` + commandes documentées dans CLAUDE.md fonctionnent

### F-002 — Setup Docker & docker-compose
- Dockerfile pour `api`, `frontend`, `backoffice`
- `docker-compose.yml` avec services : `postgres`, `api`, `frontend`, `backoffice`
- Volumes persistants pour Postgres
- `.env.example` documenté
- **Critères** : `docker compose up` lance la stack complète, accessible localement

### F-003 — Setup base de données & ORM
- PostgreSQL 16 dans docker-compose
- SQLAlchemy 2.x configuré (session async)
- Alembic initialisé avec première migration vide
- Script de seed pour environnement de dev
- **Critères** : `alembic upgrade head` fonctionne, modèle de base testable

### F-004 — Setup FastAPI & structure backend
- Architecture en couches (`models`, `schemas`, `repositories`, `services`, `api/v1`)
- Configuration via Pydantic Settings
- Middleware CORS, gestion d'erreurs centralisée
- Endpoint `/health` et `/api/v1/version`
- OpenAPI exposé sur `/docs`
- **Critères** : `GET /health` retourne 200, `/docs` affiche le schéma

### F-005 — Setup React + Vite (front public)
- Vite + React 18 + TypeScript strict
- Tailwind CSS + shadcn/ui initialisé
- React Router v6
- TanStack Query configuré
- Layout de base (header, footer, container)
- **Critères** : page d'accueil vide rendue, hot reload OK

### F-006 — Setup React + Vite (back-office)
- Même stack que F-005
- Layout admin distinct (sidebar, header)
- **Critères** : app accessible sur un port différent, structure prête

### F-007 — Génération des types depuis OpenAPI
- Script `pnpm generate:api` qui appelle `openapi-typescript` sur le schéma FastAPI
- Sortie dans `packages/shared-types`
- Importable depuis les deux fronts
- **Critères** : modifier un schéma Pydantic régénère les types TS

### F-008 — Setup CI GitHub Actions
- Workflow `ci.yml` avec jobs : `lint-backend`, `test-backend`, `lint-frontend`, `test-frontend`, `lint-backoffice`, `test-backoffice`, `build`
- Service Postgres pour les tests d'intégration
- Cache des dépendances (`uv`, `pnpm`)
- Badge de coverage dans le README
- **Critères** : la CI s'exécute sur PR et bloque le merge si rouge

### F-009 — Setup linters & pre-commit
- `ruff` + `mypy --strict` côté Python
- `eslint` + `prettier` + `tsc` côté JS
- `pre-commit` hooks configurés
- **Critères** : un commit avec une erreur de lint est rejeté

### F-010 — Setup tests & coverage
- pytest + pytest-cov + pytest-asyncio + httpx
- Vitest + RTL + MSW
- Seuils : 80% backend, 70% fronts
- Échec CI si seuil non atteint
- **Critères** : `pytest --cov` et `vitest run --coverage` fonctionnent

---

## EPIC 1 — Authentification & utilisateurs (P0/P1)

### F-101 — Authentification Google OAuth 2.0 (P0)
- Flow OAuth côté backend (callback `/api/v1/auth/google/callback`)
- Vérification du `hd` claim pour restreindre à `@eleven-labs.com`
- Création automatique de l'astronaute à la première connexion
- Émission d'un JWT signé
- **Tests** : refus d'un email hors domaine, création utilisateur OK, JWT valide

### F-102 — Gestion des sessions front (P0)
- Stockage du JWT (httpOnly cookie privilégié, fallback localStorage)
- Hook `useAuth()` côté front
- Redirect vers login si non authentifié
- Logout
- **Tests** : route protégée bloquée sans token, accessible avec token

### F-103 — Système de rôles applicatifs (P1)
- Rôle `astronaut` (par défaut) et `admin`
- Décorateur/dépendance FastAPI `require_admin`
- Migration BDD pour le champ `roles` (JSONB ou table de jonction)
- **Tests** : un non-admin reçoit 403 sur une route admin

### F-104 — Attribution d'admin via back-office (P1)
- Page back-office pour lister les astronautes et toggle le rôle admin
- Audit log de l'attribution
- **Tests** : un admin peut promouvoir un autre, un non-admin ne peut pas

---

## EPIC 2 — Modèle métier & configuration (P1)

### F-201 — Modèle Planet
- CRUD complet (admin only)
- Champs : nom, mantra, blason_url, color_hex, is_competing, is_default_for_newcomers
- Seed des 6 planètes existantes
- **Tests** : création, modification, suppression contrôlée, unicité du nom

### F-202 — Modèle Astronaut
- CRUD (admin) + édition de son propre profil par l'astronaute
- Champs : prénom, nom, email, photo, hobbies, client, planète, hire_date, total_points
- **Tests** : un astronaute ne peut modifier que son profil, admin peut tout

### F-203 — Modèle Season
- CRUD admin
- Une seule saison `is_active` à la fois
- Job de bascule : à la fin d'une saison, reset des compteurs planète, conservation des points individuels
- **Tests** : reset planète OK, points individuels intacts, archivage des trophées

### F-204 — Modèle Activity
- CRUD admin
- Catalogue pré-rempli avec les activités du brief (challenges, blogs, talks, workshops, etc.)
- Champs : nom, base_points, catégorie, is_collaborative, allow_multiple_assignees
- **Tests** : création, association à une attribution

### F-205 — Modèle Grade (paliers astronaute)
- CRUD admin
- Seed avec les 14 grades du brief (rookie → Fleet Admiral 3 stars)
- Calcul du grade courant en fonction des points totaux
- **Tests** : un astronaute à 0 pt = rookie, à 10000 pts = Fleet Admiral 2 stars

### F-206 — Configuration ancienneté
- Endpoint admin pour configurer `points_per_year`
- Application au calcul du total des points
- **Tests** : modification de la valeur affecte le total des astronautes concernés

---

## EPIC 3 — Attribution de points (P1)

### F-301 — Attribution de points à un astronaute
- Endpoint admin `POST /api/v1/point-attributions`
- Lien activité + astronaute + saison courante (auto)
- Mise à jour des compteurs astronaute ET planète
- Historisation immuable
- **Tests** : attribution incrémente bien les deux compteurs, rattachement saison correct

### F-302 — Attribution à plusieurs co-auteurs
- Pour les activités `is_collaborative` (article à deux, workshop à deux)
- Chaque co-auteur reçoit le total de points (pas de split)
- **Tests** : 2 astronautes reçoivent chacun 40 pts pour un article à deux

### F-303 — Multiplicateur "1ère contribution ever"
- Détection automatique : si l'astronaute n'a aucun `PointAttribution` antérieur, points × 2
- **Tests** : 2e contribution = base ; 1ère = ×2 ; cas limite avec attributions simultanées

### F-304 — Bonus "1ère contribution de la saison"
- +25 pts automatiques si c'est la 1ère contribution de l'astronaute dans la saison active
- **Tests** : déclenché une seule fois par saison

### F-305 — Calcul automatique des points d'ancienneté
- Job (à la création de saison ou cron) qui crédite `years_in_company × points_per_year`
- **Tests** : un astronaute embauché il y a 3 ans avec 50 pts/an reçoit 150 pts

### F-306 — Suppression / correction d'une attribution
- Admin uniquement, audit log obligatoire
- Recalcul des compteurs
- **Tests** : suppression décrémente bien les totaux

---

## EPIC 4 — Trophées (P1/P2)

### F-401 — Modèle Trophy & attribution manuelle (P1)
- CRUD admin
- Attribution manuelle à un astronaute ou à une planète
- **Tests** : attribution OK, lien à la saison

### F-402 — Trophées automatiques par règles (P2)
- Moteur de règles : `rule_type=automatic`, `rule_config` JSON
- Exemples : "3 articles dans la saison", "atteindre 500 pts", "1er d'un challenge ×3"
- Évaluation déclenchée après chaque attribution de points
- **Tests** : règle de "3 articles" déclenche bien après le 3e, pas avant

### F-403 — Affichage des trophées sur la fiche astronaute (P1)
- Section dédiée avec icône, date d'obtention, saison
- **Tests** : rendering avec 0, 1, plusieurs trophées

### F-404 — Historique des trophées planète (P1)
- Vue dédiée sur la page planète, groupé par saison
- **Tests** : tri chronologique, filtrage par saison

---

## EPIC 5 — Front public — Trombinoscope & profils (P1)

### F-501 — Page trombinoscope
- Grille des astronautes avec photo, nom, planète
- Recherche par nom
- Filtre par planète
- Pagination ou scroll infini
- **Tests** : recherche, filtre, état vide

### F-502 — Page profil astronaute (consultation)
- Infos perso, planète, total points, grade courant
- Historique des contributions (paginé)
- Trophées
- Lien vers la planète
- **Tests** : rendu complet, accès à un profil inexistant = 404

### F-503 — Édition de son propre profil
- Modification : photo, hobbies, client (champs autorisés uniquement)
- Pas de modification de l'email, de la planète, des points
- **Tests** : on ne peut pas modifier le profil d'un autre, champs interdits rejetés

### F-504 — Page détail planète ✅ (mock front-only)
- ✅ Header : blason, couleur, total de points saison courante
- ✅ Liste des astronautes membres (triée par points, grade affiché)
- ✅ Historique des trophées (icône, description, date)
- ✅ Historique des contributions (astronaute, activité, points, bonus)
- ⏳ À connecter à l'API quand le backend sera prêt (React Query hooks)
- **Note** : accessible via clic sur une planète depuis le système solaire

### F-505 — Page classement / scoreboard ✅ (mock front-only, widget)
- ✅ Leaderboard des 4 planètes en compétition sur la homepage (trié par score, barres de progression)
- ⏳ Pas de page dédiée pour l'instant — acceptable pour le MVP visuel
- ⏳ À connecter à l'API (polling React Query)

---

## EPIC 6 — Back-office (P1)

### F-601 — Dashboard admin
- Vue d'ensemble : nb astronautes, saison active, dernières attributions
- **Tests** : agrégations correctes

### F-602 — Gestion des planètes
- Liste, création, édition, suppression
- Upload de blason
- **Tests** : CRUD complet

### F-603 — Gestion des astronautes
- Liste avec recherche, filtre par planète
- Création, édition, suppression
- Réaffectation à une autre planète
- **Tests** : CRUD complet, réaffectation conserve les points

### F-604 — Gestion des saisons
- Création, activation, clôture
- Bascule automatique des compteurs
- **Tests** : impossibilité d'avoir 2 saisons actives, clôture déclenche reset planète

### F-605 — Gestion des grades & paliers
- Édition de la liste des grades et de leurs seuils
- **Tests** : modification d'un seuil recalcule les grades affichés

### F-606 — Gestion des activités
- CRUD du catalogue d'activités
- Édition des points par défaut
- **Tests** : CRUD, validation des champs

### F-607 — Attribution de points (UI)
- Formulaire : sélection astronaute(s), sélection activité, points calculés (modifiables avec justification)
- Multi-sélection pour les activités collaboratives
- **Tests** : flow complet, validation, feedback succès

### F-608 — Gestion des trophées
- CRUD trophées
- Attribution manuelle
- Configuration des règles automatiques (P2)
- **Tests** : CRUD, attribution

### F-609 — Interface "Présence aux events"
- Recherche d'astronautes (search bar + liste avec photos)
- Multi-sélection rapide
- Enregistrement de la présence à un événement **sans déclenchement de points**
- **Tests** : sélection, sauvegarde, aucun point attribué

---

## EPIC 7 — Webhooks & intégrations (P2)

### F-701 — Configuration des webhooks
- CRUD admin pour les URLs de webhook par type d'événement
- **Tests** : CRUD, validation d'URL

### F-702 — Émission webhook attribution de points
- Envoi async vers Slack à chaque attribution
- Template de message configurable
- **Tests** : appel mocké déclenché, échec non bloquant

### F-703 — Émission webhook trophée
- Idem F-702 pour les trophées
- **Tests** : déclenchement à l'attribution

### F-704 — Émission webhook passage de grade
- Détection du changement de grade après attribution
- **Tests** : déclenché uniquement au franchissement

---

## EPIC 8 — Observabilité & opérations (P2)

### F-801 — Logging structuré
- Logs JSON côté backend
- Niveaux configurables
- **Tests** : présence des champs requis

### F-802 — Healthchecks avancés
- `/health/live` et `/health/ready` (vérifie BDD)
- **Tests** : 503 si BDD down

### F-803 — Audit log
- Traçabilité des actions admin (qui, quoi, quand)
- Consultable dans le back-office
- **Tests** : entrée créée pour chaque action sensible

---

## EPIC 9 — Polish & accessibilité (P3)

### F-901 — Responsive mobile
- Adaptation mobile des deux fronts
- **Tests** : tests visuels Playwright sur viewport mobile

### F-902 — Accessibilité (a11y)
- Conformité WCAG AA basique (contrastes, alt, aria, navigation clavier)
- **Tests** : `axe-core` dans les tests Playwright

### F-903 — Mode sombre
- Toggle dark/light côté front public
- **Tests** : persistance de la préférence

### F-904 — Notifications in-app
- Toast lors d'événements (attribution reçue, trophée gagné)
- **Tests** : déclenchement, dismiss

### F-905 — Export CSV des données
- Export historique des points, classement, etc.
- **Tests** : format correct

---

## Récapitulatif des priorités

| Priorité | Epics | Objectif |
|---|---|---|
| **P0** | EPIC 0 + F-101, F-102 | Fondations + auth |
| **P1** | EPICS 1 à 6 | MVP fonctionnel complet |
| **P2** | EPICS 4 (auto), 7, 8 | Trophées auto, webhooks, observabilité |
| **P3** | EPIC 9 | Polish, a11y, confort |

---

## Prérequis avant de démarrer le frontend

⚠️ Avant d'attaquer les EPICS 5 et 6 (fronts), Claude Code **doit demander à l'utilisateur** :

1. Les blasons des 6 planètes
2. Les codes couleur de chaque planète
3. Le logo Eleven Labs et la charte graphique
4. Les mantras des planètes
5. Toute maquette existante

Sans ces assets, utiliser des placeholders neutres et le signaler dans les PRs concernées.
