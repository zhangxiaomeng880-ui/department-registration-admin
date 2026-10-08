# M31 — Frontend Sync / Real Binding Gate V0.1

**Evaluation date:** 2026-10-08
**Decision:** IMPLEMENTATION CHECK PASS / LIVE FRONTEND GATE FAIL (not deployed)
**Old chatgpt.site:** PROTOTYPE_ONLY / DO NOT PROMOTE

## Real source of truth

- Runtime branch: `feat/frontend-sync-project-list-m31`, based on C19-P2 staging SHA `25c6c92de126dd409db5f1359b23103d8ca98d12`
- Backend PR: https://github.com/zhangxiaomeng880-ui/department-registration-backend/pull/18
- Console PR: https://github.com/zhangxiaomeng880-ui/department-registration-admin/pull/13
- Real project list implemented as a separate authenticated endpoint: `GET /api/runtime/projects?workspaceId=<id>`.
- Workflow `GET /projects/:id/lifecycle`, `GET /projects/:id/stage-transitions`, real governance/AIGC/Product domain endpoints, M30 server audit.
- 15 AIGC stage keys: AIGC_00_INIT through AIGC_14_REVIEW; names and status come from Runtime lifecycle, never fabricated.

## Verified on the code branch

| Gate | Status | Evidence |
|---|---|---|
| Source code isolated from old City Service UI | PASS | `apps/ai-native-console/` |
| No browser mockData/localStorage catalogue | PASS | `AI Native Console M31` CI |
| Server-only Runtime bearer auth | PASS (code test) | `tests/console.test.mjs` |
| Same-origin POST and restricted Runtime proxy | PASS (code test) | `tests/console.test.mjs` |
| True POST /api/runtime/projects proxy | PASS (proxy mock-upstream + backend real MySQL persistence and audit tests) | `tests/console.test.mjs` |
| Scoped GET project list, pagination, query validation | PASS (real MySQL + code test) | `test/frontend-sync-api.test.mjs` in backend |
| Frontend CI | PASS | GitHub Actions run 37723849040 (plus subsequent scope-fallback commit CI) |
| Backend CI | PASS | Real MySQL integration run 37723830080 |
| Existing Production untouched | PASS | Changes only in isolated feature branches |

## P0 blockers before live frontend Gate PASS

1. **Deploy code to isolated Staging first**. No production promotion or old-site replacement until authorization.
2. **Securely configure secrets** on server only, ideally least privilege and separate console login / SSO. Current demo-grade password sessions are staging-only.
3. **Real DB E2E**: select real workspace, read exact project list and stages, create disposable controlled test project when authorized, verify persistence after new session and refresh, review Gate and transition evidence.
4. **Audit correctness/freshness**: M30 audit source may be a materialized index; verify index refresh & evidence lineage. Project-creation event linkage requires validation, and absence must not be disguised.
5. **Files/artifacts**: authorized file-serving contract, stable artifact_id/file_id, version, rights and openability missing. Until then show gated/no link.
6. **15-stage AIGC**: confirm staging actual workflow bound with 15 instances and Publication → Performance → Review → Next Round real records.
7. **No fake state-changing controls**: stage PASS/FAIL cannot become a client toggle. Check actual Gate/Checkpoint/Run/idempotency contract before enabling.
8. **Security & production**: scoped identity/RBAC, audit, session scaling, access management, secret rotation, error handling and full real-data E2E must PASS before release.

## Release policy

This is **not** a frontend or platform launch approval. Existing staging Runtime and MySQL are not modified by branch commits. Frontend gate is HOLD/FAIL until blockers above are verified with evidence. Existing PASS/FROZEN backend work is preserved.

## Incremental M31 verification — 2026-10-08

- **Source-of-truth audit:** authenticated POST project creation inserts `projects` and `PROJECT_CREATED` into `audit_logs` in one transaction; audit failure forces rollback.
- **Live read:** `GET /api/runtime/projects/:id/audit-events` reads original `audit_logs`; M30 `audit-evidence` remains a possibly stale indexed view and is labeled separately.
- **MySQL test:** unique project ID persists across re-query; no cross-workspace leakage; audit entry exists; failed audit insert rolls back project creation. GitHub Actions run `37723830080` PASS.
- **Least privilege:** workspace/project listing does not fail merely because admin-only catalogues return 403; no mock fallback. Frontend CI run `37723849040` PASS.
- **Security:** API proxy allowlist, login throttling and anti-cross-origin checks tested. The single shared Staging console login and server token **are not production identity/RBAC**; do not promote.
- **Deployment:** Railway Staging is still on `feat/c19-p2-product-real-loop-materialization`, with no M31 Runtime or console deployment. No Railway patch or production changes applied this round.
