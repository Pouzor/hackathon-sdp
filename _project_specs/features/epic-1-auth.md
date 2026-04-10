# EPIC 1 — Authentification & utilisateurs (P0/P1)

## F-101 — Authentification Google OAuth 2.0 (P0)

**Description:** Flow OAuth complet côté backend, restreint @eleven-labs.com.

**Acceptance Criteria:**
- [ ] Endpoint `GET /api/v1/auth/google` redirige vers Google
- [ ] Callback `GET /api/v1/auth/google/callback` traite le code OAuth
- [ ] Vérification du `hd` claim (`eleven-labs.com` uniquement)
- [ ] Création automatique de l'astronaute à la 1ère connexion
- [ ] Émission d'un JWT signé (HS256) avec claims : `sub`, `email`, `astronaut_id`, `roles`, `planet_id`, `exp`

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Email `@eleven-labs.com` | 200 + JWT |
| Email `@gmail.com` | 403 |
| 2ème connexion même email | Pas de doublon astronaute |
| JWT expiré | 401 |

---

## F-102 — Gestion des sessions front (P0)

**Description:** Gestion du JWT côté frontend, protection des routes.

**Acceptance Criteria:**
- [ ] JWT stocké en httpOnly cookie (ou localStorage en fallback)
- [ ] Hook `useAuth()` exposant `user`, `isAuthenticated`, `logout`
- [ ] `<ProtectedRoute>` composant qui redirige vers `/login` si non auth
- [ ] Page `/login` avec bouton "Se connecter avec Google"
- [ ] Logout fonctionnel (supprime le token)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Route protégée sans token | Redirect vers /login |
| Route protégée avec token valide | Accès autorisé |
| Logout | Token supprimé, redirect /login |
| Token expiré | Redirect vers /login |

---

## F-103 — Système de rôles applicatifs (P1)

**Description:** Rôles `astronaut` et `admin`, enforcement backend.

**Acceptance Criteria:**
- [ ] Champ `roles` sur `Astronaut` (JSONB ou table de jonction)
- [ ] Migration Alembic pour le champ `roles`
- [ ] Dépendance FastAPI `require_admin` (lève 403 si pas admin)
- [ ] Rôle `astronaut` attribué par défaut à la création

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Non-admin sur route admin | 403 Forbidden |
| Admin sur route admin | 200 |
| Nouveau astronaute | Rôle `astronaut` par défaut |

---

## F-104 — Attribution d'admin via back-office (P1)

**Description:** Interface backoffice pour gérer les rôles admin.

**Acceptance Criteria:**
- [ ] Page backoffice listant tous les astronautes avec leur rôle
- [ ] Toggle admin (promote/demote) avec confirmation
- [ ] Audit log de chaque changement de rôle
- [ ] Un admin ne peut pas se retirer lui-même ses droits

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Admin toggle rôle d'un autre | Rôle mis à jour, audit log créé |
| Non-admin accède au backoffice | Redirect vers frontend |
| Admin tente de se retirer son rôle | Erreur explicite |
