# EPIC 1 — Authentification & utilisateurs (P0/P1)

## F-101 — Authentification Google OAuth 2.0 (P0) ✅ DONE

**Description:** Flow OAuth complet côté backend, restreint @eleven-labs.com.

**Implémentation :**
- `apps/api/src/api/v1/auth.py` — routes `/google`, `/google/callback`, `/me`
- `apps/api/src/services/auth.py` — AuthService complet
- `apps/api/src/schemas/auth.py` — GoogleUserInfo, TokenResponse, AstronautMe
- PR #5 mergée le 2026-04-12

**Acceptance Criteria:**
- [x] Endpoint `GET /api/v1/auth/google` redirige vers Google
- [x] Callback `GET /api/v1/auth/google/callback` traite le code OAuth
- [x] Vérification du `hd` claim (`eleven-labs.com` uniquement)
- [x] Création automatique de l'astronaute à la 1ère connexion
- [x] Émission d'un JWT signé (HS256) avec claims : `sub`, `email`, `astronaut_id`, `roles`, `planet_id`, `exp`
- [x] Callback redirige vers `{FRONTEND_URL}/auth/callback?token=<JWT>` (flow navigateur)

---

## F-102 — Gestion des sessions front (P0) ✅ DONE

**Description:** Gestion du JWT côté frontend, protection des routes.

**Implémentation :**
- `apps/frontend/src/hooks/useAuth.ts` — hook JWT localStorage
- `apps/frontend/src/components/features/ProtectedRoute.tsx`
- `apps/frontend/src/routes/auth/LoginPage.tsx` + `AuthCallbackPage.tsx`
- `apps/frontend/src/App.tsx` mis à jour (routes publiques / protégées)
- PR #6 mergée le 2026-04-12

**Acceptance Criteria:**
- [x] JWT stocké en localStorage (`auth_token`)
- [x] Hook `useAuth()` exposant `user`, `isAuthenticated`, `isAdmin`, `logout`
- [x] `<ProtectedRoute>` composant qui redirige vers `/login` si non auth
- [x] Page `/login` avec bouton "Se connecter avec Google"
- [x] Logout fonctionnel (supprime le token)
- [x] `AuthCallbackPage` : lit `?token=`, stocke, redirige vers `/`

---

## F-103 — Système de rôles applicatifs (P1) ✅ DONE

**Description:** Rôles `astronaut` et `admin`, enforcement backend.

**Implémentation :**
- `apps/api/src/models/astronaut.py` — champ `roles: ARRAY(String)`, défaut `["astronaut"]`
- `apps/api/src/core/deps.py` — `require_admin`, `CurrentAdmin`
- `apps/api/src/db/migrations/versions/001_initial_schema.py` — colonne `roles` incluse
- Tests dans `tests/unit/test_deps.py`

**Acceptance Criteria:**
- [x] Champ `roles` sur `Astronaut` (ARRAY PostgreSQL)
- [x] Migration Alembic pour le champ `roles`
- [x] Dépendance FastAPI `require_admin` (lève 403 si pas admin)
- [x] Rôle `astronaut` attribué par défaut à la création

---

## F-104 — Attribution d'admin via back-office (P1) 🔶 EN COURS

**Description:** Endpoint backend + interface backoffice pour gérer les rôles admin.

**Acceptance Criteria:**
- [ ] Endpoint `PATCH /api/v1/astronauts/{id}/roles` (admin only)
- [ ] Un admin ne peut pas se retirer lui-même ses droits (403)
- [ ] Page backoffice `/roles` listant tous les astronautes avec leur rôle
- [ ] Toggle admin (promote/demote) avec confirmation
- [ ] Audit log : note dans les logs serveur (AuditLog DB = F-803)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Admin promeut un astronaute | 200, roles mis à jour |
| Admin rétrograde un autre admin | 200, roles mis à jour |
| Admin tente de se retirer son rôle | 403 |
| Non-admin sur `PATCH /roles` | 403 |
