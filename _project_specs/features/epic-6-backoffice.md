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

## F-602 — Gestion des planètes

**Route:** `/planets`

**Acceptance Criteria:**
- [ ] Liste avec nom, couleur, is_competing, nb astronautes
- [ ] Création, édition, suppression (protégée si astronautes rattachés)
- [ ] Upload de blason (image)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Création planète | Apparaît dans la liste |
| Suppression planète peuplée | Erreur explicite |
| Upload blason | URL stockée, préview affichée |

---

## F-603 — Gestion des astronautes

**Route:** `/astronauts`

**Acceptance Criteria:**
- [ ] Liste avec search + filtre planète
- [ ] Création, édition (tous champs), suppression
- [ ] Réaffectation planète (conserve les points)
- [ ] Promotion/révocation admin (F-104)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Réaffectation planète | `total_points` inchangé |
| Suppression astronaute | Ses attributions sont archivées |

---

## F-604 — Gestion des saisons

**Route:** `/seasons`

**Acceptance Criteria:**
- [ ] Liste des saisons (actives et archivées)
- [ ] Création d'une nouvelle saison
- [ ] Activation (désactive automatiquement l'ancienne + F-305 ancienneté)
- [ ] Clôture (reset compteurs planète, archive trophées)
- [ ] Impossible d'avoir 2 saisons actives

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Activation saison 2 | Saison 1 désactivée |
| Clôture saison | Compteurs planète = 0 |
| Création saison | Points ancienneté calculés (F-305) |

---

## F-605 — Gestion des grades & paliers

**Route:** `/grades`

**Acceptance Criteria:**
- [ ] Liste des grades avec seuils éditables
- [ ] Ajout / suppression de grade
- [ ] Modification d'un seuil → grade recalculé pour tous les astronautes concernés

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Modification seuil | Grades astronautes recalculés |
| Suppression grade | Grade suivant récupère les astronautes |

---

## F-606 — Gestion des activités

**Route:** `/activities`

**Acceptance Criteria:**
- [ ] CRUD du catalogue
- [ ] Édition `base_points`, `category`, `is_collaborative`, `allow_multiple_assignees`
- [ ] Validation des champs (points > 0, nom non vide)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| `base_points = 0` | 422 |
| Modification points | N'affecte pas les attributions passées |

---

## F-607 — Attribution de points (UI)

**Route:** `/attributions/new`

**Acceptance Criteria:**
- [ ] Sélection astronaute(s) (multi-select si activité collaborative)
- [ ] Sélection activité (avec points affichés)
- [ ] Points modifiables avec justification obligatoire si modifiés
- [ ] Aperçu des modificateurs appliqués (×2 si 1ère ever, +25 si 1ère de saison)
- [ ] Feedback succès avec détail des points attribués

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
