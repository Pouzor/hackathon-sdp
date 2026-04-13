# EPIC 6 — Back-office admin (P1)

⚠️ **Prérequis avant de démarrer :** Demander les assets graphiques (logo, charte admin).

## F-601 — Dashboard admin

**Route:** `/` (backoffice)

**Acceptance Criteria:**
- [ ] Métriques : nb astronautes actifs, saison active (nom + dates), dernières 10 attributions
- [ ] Liens rapides vers les sections principales
- [ ] Données via React Query

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Pas de saison active | Bandeau d'alerte visible |
| Dernières attributions | Triées par date desc |

---

## F-602 — Gestion des planètes ✅ DONE (partiel)

**Route:** `/planets`

**Implémentation :** `apps/backoffice/src/routes/planets/PlanetsAdminPage.tsx`

**Acceptance Criteria:**
- [x] Liste avec nom, couleur, is_competing, score saison
- [x] Édition inline : nom, mantra, couleur (color picker), statut compétition
- [ ] Création de planète (non implémentée — planètes créées en BDD directement)
- [ ] Upload de blason (image) — non implémenté

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Création planète | Apparaît dans la liste |
| Suppression planète peuplée | Erreur explicite |
| Upload blason | URL stockée, préview affichée |

---

## F-603 — Gestion des astronautes ✅ DONE (partiel)

**Route:** `/astronauts`

**Implémentation :** `apps/backoffice/src/routes/astronauts/AstronautsAdminPage.tsx`

**Acceptance Criteria:**
- [x] Liste avec search + filtre planète (+ filtre "Sans planète")
- [x] Réaffectation planète inline — badge doré "Non assigné" pour les non-affectés
- [x] Promotion/révocation admin (F-104) via RolesPage
- [ ] Création d'astronaute (non implémentée — OAuth only)
- [ ] Suppression astronaute

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Réaffectation planète | `total_points` inchangé |
| Suppression astronaute | Ses attributions sont archivées |

---

## F-604 — Gestion des saisons ✅ DONE

**Route:** `/seasons`

**Implémentation :** `apps/backoffice/src/routes/seasons/SeasonsAdminPage.tsx`

**Acceptance Criteria:**
- [x] Liste des saisons (actives et archivées), triées par date
- [x] Création d'une nouvelle saison (nom + date début)
- [x] Activation avec confirmation (désactive l'ancienne côté backend)
- [x] Clôture avec confirmation (reset compteurs planète)
- [x] Impossible d'avoir 2 saisons actives (géré par le backend)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Activation saison 2 | Saison 1 désactivée |
| Clôture saison | Compteurs planète = 0 |
| Création saison | Points ancienneté calculés (F-305) |

---

## F-605 — Gestion des grades & paliers ✅ DONE

**Route:** `/grades`

**Implémentation :** `apps/backoffice/src/routes/grades/GradesAdminPage.tsx`

**Acceptance Criteria:**
- [x] Liste des grades triés par ordre, seuils éditables inline
- [x] Ajout de grade (nom, seuil, ordre)
- [x] Suppression avec confirmation
- [x] Modification d'un seuil (recalcul automatique géré par le backend à chaque requête)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Modification seuil | Grades astronautes recalculés |
| Suppression grade | Grade suivant récupère les astronautes |

---

## F-606 — Gestion des activités ✅ DONE

**Route:** `/activities`

**Implémentation :** `apps/backoffice/src/routes/activities/ActivitiesAdminPage.tsx`

**Acceptance Criteria:**
- [x] CRUD du catalogue (création, édition inline, toggle actif/inactif)
- [x] Édition `base_points`, `category`, `is_collaborative`, `allow_multiple_assignees`
- [x] Activités inactives visuellement différenciées (opacité réduite)
- [x] Validation des champs (points > 0, nom non vide — côté formulaire et backend)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `base_points = 0` | 422 |
| Modification points | N'affecte pas les attributions passées |

---

## F-607 — Attribution de points (UI) ✅ DONE

**Route:** `/attributions/new`

**Implémentation :** `apps/backoffice/src/routes/attributions/AttributionPage.tsx`

**Acceptance Criteria:**
- [x] Sélection astronaute(s) (multi-select si activité collaborative)
- [x] Sélection activité (avec points affichés)
- [x] Points modifiables avec justification obligatoire si modifiés
- [x] Aperçu des modificateurs appliqués (×2 si 1ère ever, +25 si 1ère de saison)
- [x] Feedback succès avec détail des points attribués

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Activité non collaborative + 2 astronautes | Multi-select désactivé |
| 1ère contribution astronaute | Aperçu montre ×2 |
| Points modifiés sans justification | Validation bloquée |

---

## F-608 — Gestion des trophées

**Route:** `/trophies`

**Acceptance Criteria:**
- [ ] CRUD trophées
- [ ] Attribution manuelle (formulaire astronaute ou planète)
- [ ] Configuration règles automatiques (P2, formulaire JSON ou UI simplifiée)

---

## F-610 — Synchronisation des astronautes depuis Google Workspace

**Route:** bouton dans F-603 (gestion des astronautes)

**Description:** L'admin connecté peut déclencher une synchronisation depuis l'annuaire Google Workspace Eleven Labs. Les utilisateurs du domaine `@eleven-labs.com` sont importés automatiquement (création si inexistant, mise à jour si déjà présent).

**Prérequis :**
- Activer **Admin SDK API** dans Google Cloud Console
- Ajouter le scope `https://www.googleapis.com/auth/admin.directory.user.readonly` à l'OAuth app
- Le compte qui déclenche la synchro doit être admin Google Workspace

**Backend :**
- Endpoint `POST /api/v1/admin/sync-google-users` (admin uniquement)
- Utilise le token Google de l'admin connecté (stocker le `access_token` Google au moment du callback OAuth)
- Appelle `GET https://admin.googleapis.com/admin/directory/v1/users?domain=eleven-labs.com&maxResults=500`
- Pour chaque utilisateur : `upsert` en BDD (email comme clé, met à jour `first_name`, `last_name`, `photo_url`)
- Retourne un résumé : `{ created: N, updated: N, skipped: N }`

**Frontend (backoffice) :**
- Bouton "Synchroniser avec Google" dans la page `/astronauts`
- Dialog de confirmation avant lancement
- Affiche le résumé après synchro (X créés, Y mis à jour)

**Acceptance Criteria:**
- [ ] Scope `admin.directory.user.readonly` ajouté au flow OAuth
- [ ] `access_token` Google stocké temporairement côté backend (session ou BDD)
- [ ] `POST /api/v1/admin/sync-google-users` : upsert tous les users du domaine
- [ ] Utilisateurs désactivés dans Google Workspace ignorés (`suspended: true`)
- [ ] Non-admin → 403
- [ ] Token Google expiré → 401 avec message explicite ("Reconnectez-vous pour synchroniser")
- [ ] Résumé affiché côté front

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 1er import | Tous les users créés, `roles: ["astronaut"]` par défaut |
| 2e import | Mise à jour `photo_url`/`first_name`, pas de doublon |
| User suspendu Google | Ignoré (pas créé, pas mis à jour) |
| Non-admin | 403 |
| Token expiré | 401 + message "Reconnectez-vous" |

---

## F-609 — Interface "Présence aux events"

**Route:** `/events/:id/attendance`

**Acceptance Criteria:**
- [ ] Recherche d'astronautes (search bar live)
- [ ] Multi-sélection avec photos
- [ ] Enregistrement de présence **sans point attribué**
- [ ] Confirmation visuelle

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Enregistrement présence | `PointAttribution` NON créée |
| `Event` lié | Astronaute enregistré sur l'event |
