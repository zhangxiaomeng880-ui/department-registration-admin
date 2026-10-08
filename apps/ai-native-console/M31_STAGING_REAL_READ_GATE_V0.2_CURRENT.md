# AI Native 2.0 M31 — Staging Real Read Gate V0.2 CURRENT

**Date:** 2026-10-08
**Decision:** STAGING READ-ONLY REAL BINDING = PASS; FULL FRONTEND SYNC GATE = HOLD / NOT RELEASED.
**Environment:** ai-native-runtime-v2-staging only; production unchanged.

## Exact runtime evidence

| Object | Immutable evidence |
|---|---|
| Staging console service | `ai-native-console-m31` |
| Console domain | `https://ai-native-console-m31-staging.up.railway.app` |
| Console deployment | `c78e0abb-423c-42bf-a9a4-7dc068033deb` SUCCESS |
| Console pinned source | `2fef2c98b5563f5813fa6f40ed93b8e98d0e67b1` |
| Staging Runtime service | `runtime-staging-rc1` |
| Runtime deployment | `c106e977-0b68-458b-9602-916c529032cb` SUCCESS |
| Runtime pinned source | `cfc5f0a9ecf93c2871760a5691bea7d2b8204f4f` |
| MySQL Staging | `mysql-staging` SUCCESS |
| Runtime migration log | applied=0, skipped=77, total=77 |
| End-to-end network | GitHub Actions run `37724478736`, rerun #2, SUCCESS |
| Release safety | production Runtime/MySQL SUCCESS, no M31 deployment |
| Old Runtime rollback SHA | `25c6c92de126dd409db5f1359b23103d8ca98d12` |

## Read gate evidence: actual deployed HTTP requests

- Console `GET /healthz` → 200, staging identity.
- Console `GET /auth/session` → 200, authenticated=false, writesEnabled=false.
- Console unauthenticated `GET /api/runtime/workspaces` → 401.
- Runtime `GET /ready` → 200, DB ready/auth required & ready.
- Runtime unauthenticated `GET /api/runtime/projects` → 401.
- Console `GET /healthz/runtime` → 200, temporary server-only diagnostic:
  `authorizedWorkspaces=PASS`, `projectList=PASS`, `lifecycle=PASS`, `primaryAudit=PASS`.
  Test returns only PASS/BLOCKED states, not workspace IDs, projects, token, or records.

This proves real read access **through server-side authenticated BFF to the deployed Runtime and MySQL**. It does NOT prove browser user login, edit/write persistence, file serving, 15-stage AIGC final readiness or audit index refresh.

## Remaining HOLD / FAIL gates

1. **Least-privilege console identity:** Staging currently has a single strong server-managed login and a service-to-service reference to the existing staging Runtime token. Replace the token reference with a scoped console credential and multi-user session/RBAC before production. Never expose tokens in client assets.
2. **Actual browser E2E:** Browser login, selecting a real project, refresh/new session and session expiry; verify responsive UI and errors.
3. **Real mutation E2E:** Writes are deliberately disabled (`CONSOLE_ALLOW_WRITES=false`). With separate permission and disposable staging project, verify create→read-back after restart→primary audit; no synthetic PASS.
4. **15-stage AIGC:** Verify a real AIGC project's bound workflow has exactly 15 instances, and publication→performance→review→next-round factual records. Current generic lifecycle read PASS is NOT this test.
5. **Asset/document openability:** Backend artifact_id/file_id, version/status and authorized resolver API are not yet connected. No false document view/open buttons.
6. **Audit index freshness:** Primary audit read PASS; M30 snapshot index freshness and trace chain remain separate.
7. **Agent/Gate actions:** True operation must invoke authorized Runtime APIs and persist run, Gate, checkpoint, idempotency and audit; not mock toggles.

## Pinned rollback

Staging Runtime may be rolled back from M31 `cfc5f0a` to C19-P2 `25c6c92` using Railway source revision if a regression emerges. Do not change production.

**Do not close Frontend Real Binding Gate** before all required E2E and rights/security gates PASS.
