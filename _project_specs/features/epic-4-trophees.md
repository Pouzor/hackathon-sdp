# EPIC 4 — Trophées (P1/P2)

## F-401 — Modèle Trophy & attribution manuelle (P1)

**Acceptance Criteria:**
- [ ] CRUD trophées (admin) : `name`, `description`, `icon_url`, `rule_type`, `rule_config`, `season_id`
- [ ] Attribution manuelle : `POST /api/v1/trophy-attributions`
- [ ] Cible : astronaute OU planète (pas les deux)
- [ ] Lié à la saison active automatiquement

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Attribution à astronaute | 201, lié à la saison |
| Attribution à planète ET astronaute | 422 |
| Non-admin | 403 |

---

## F-402 — Trophées automatiques par règles (P2)

**Description:** Moteur de règles JSON évalué après chaque attribution de points.

**Acceptance Criteria:**
- [ ] `rule_type = "automatic"`, `rule_config` en JSON
- [ ] Règles supportées : `min_activities_in_season`, `min_points_total`, `challenge_rank`
- [ ] Évaluation async après chaque `PointAttribution`
- [ ] Attribution unique par astronaute/planète par saison pour un trophée donné

**Exemple rule_config:**
```json
{"type": "min_activities_in_season", "activity_category": "article", "min_count": 3}
```

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Règle "3 articles", astronaute en a 2 | Pas de trophée |
| Astronaute soumet 3ème article | Trophée attribué |
| 4ème article | Pas de doublon |

---

## F-403 — Affichage des trophées sur la fiche astronaute (P1)

**Acceptance Criteria:**
- [ ] Section trophées sur la page profil
- [ ] Icône + nom + date + saison
- [ ] État vide géré (message neutre)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| 0 trophée | Message "Aucun trophée pour l'instant" |
| Plusieurs trophées | Tous affichés, triés par date |

---

## F-404 — Historique des trophées planète (P1)

**Acceptance Criteria:**
- [ ] Section sur la page planète
- [ ] Groupé par saison
- [ ] Tri chronologique
- [ ] Filtre par saison

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Planète avec 3 trophées sur 2 saisons | 2 groupes affichés |
| Filtre par saison | Seuls les trophées de cette saison |
