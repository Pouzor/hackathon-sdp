# EPIC 8 — Observabilité & opérations (P2)

## F-801 — Logging structuré

**Acceptance Criteria:**
- [ ] Logs JSON (`structlog` ou `loguru`)
- [ ] Champs : `timestamp`, `level`, `service`, `request_id`, `user_id`, `message`
- [ ] Niveau configurable via env `LOG_LEVEL`

---

## F-802 — Healthchecks avancés

**Acceptance Criteria:**
- [ ] `GET /health/live` → 200 toujours (app alive)
- [ ] `GET /health/ready` → 200 si BDD OK, 503 sinon
- [ ] Utilisé par docker-compose `healthcheck`

---

## F-803 — Audit log

**Acceptance Criteria:**
- [ ] Table `audit_logs` : `actor_id`, `action`, `target_type`, `target_id`, `before`, `after`, `created_at`
- [ ] Alimenté pour toutes les actions admin sensibles
- [ ] Page de consultation dans le back-office (filtrable par acteur, action, date)

**Actions à tracer:**
- Attribution de points (création/suppression)
- Attribution de trophée
- Changement de rôle
- Création/clôture de saison
- Modification de grade/seuil
