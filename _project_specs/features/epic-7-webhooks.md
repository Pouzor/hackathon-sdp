# EPIC 7 — Webhooks & intégrations (P2)

## F-701 — Configuration des webhooks

**Acceptance Criteria:**
- [ ] CRUD admin pour URLs par type (`points`, `trophy`, `grade_up`, `season`)
- [ ] Validation d'URL (format HTTPS)
- [ ] Test "ping" depuis le back-office

---

## F-702 — Émission webhook attribution de points

**Acceptance Criteria:**
- [ ] Envoi async (BackgroundTasks FastAPI) vers Slack après attribution
- [ ] Payload : astronaute, activité, points, planète, saison
- [ ] Échec non bloquant (loggé, pas de retry en MVP)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Attribution OK | Webhook envoyé (mock) |
| URL webhook invalide | Attribution réussie, erreur loggée |

---

## F-703 — Émission webhook trophée

**Acceptance Criteria:**
- [ ] Envoi async après attribution de trophée
- [ ] Payload : astronaute/planète, trophée, saison

---

## F-704 — Émission webhook passage de grade

**Acceptance Criteria:**
- [ ] Détection du changement de grade après chaque attribution de points
- [ ] Envoi async uniquement au franchissement (pas à chaque attribution)

**Test Cases:**
| Cas | Attendu |
|-----|---------|
| Points franchissent seuil grade | Webhook envoyé |
| Attribution sans changement de grade | Pas de webhook |
