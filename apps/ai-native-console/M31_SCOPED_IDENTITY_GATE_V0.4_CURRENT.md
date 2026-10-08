# AI Native 2.0 — M31 Scoped Identity Gate V0.4 CURRENT

Date: 2026-10-08

**Decision: scoped identity API + Staging deployment PASS; real personal credential provisioning/live login HOLD. Full Frontend Sync Gate is NOT yet PASS.**

## Deployed immutable staging evidence

- Isolated Console: `ai-native-console-m31` — Railway deployment `a2453cd2-96a4-48ae-93c3-d95934d3b870` SUCCESS, pinned source `f3011240840446c5e75d3aa09b121d4c99dab131`.
- Backend Runtime: `runtime-staging-rc1` — Railway deployment `85d21f58-268f-430d-9ec2-99c4af238144` SUCCESS, pinned source `3fb8607b0b345ed45295237c729da2366c68f8a7`.
- Staging MySQL: SUCCESS.
- Production Runtime and MySQL have no M31 source changes, both remain SUCCESS.
- GitHub CI frontend scoped/login + tests: `37727629488` PASS.
- GitHub CI backend self identity/permission contract: `37727513545` PASS.
- GitHub Actions real anonymous Staging HTTP: `37727720894` PASS.
- Earlier authenticated server-to-server project/MySQL/lifecycle/audit read: `37724478736` rerun #2 PASS.

## Actual implemented identity contract

- New Runtime `GET /api/runtime/me` is behind the existing Runtime auth middleware. It derives `identityId,tenantId,workspaceId,platformAdmin,permissions` only from the verified principal, not from caller-supplied identity IDs.
- Runtime scoped credentials continue to use salted-looking random opaque `rtk_` format, server-side hash validation and DB-backed role membership from the existing M22.4 RBAC implementation.
- Console personal login requires `principalType=SCOPED`, `platformAdmin=false`, identity, and effective `workspace:read` + `project:read`, plus at least one authorized workspace.
- User Runtime token is supplied only via HTTPS login and then held server-side within an eight-hour process-local session. Browser holds HttpOnly SameSite=Strict cookie; no localStorage/token in browser app bundle.
- Server API proxy uses that **session's** scoped credential for each Runtime call; revoked Runtime tokens are denied on next read and the Console session is cleared.
- Create-project button and proxy POST additionally require effective `project:write` AND `CONSOLE_ALLOW_WRITES=true`; shared Staging mode is forced to read-only even when a global write gate is set true.
- Explicit Staging compatibility switch `CONSOLE_ALLOW_SHARED_ADMIN_LOGIN=true` currently maintains shared **read-only** login, still using the existing server-only platform token. It is a bridge, **not** a personal identity, and must be disabled/removed before production.
- Temporary public Runtime read diagnostic is disabled: `CONSOLE_RUNTIME_PROBE_ENABLED=false`.

## Online Staging smoke

Run `37727720894` returned actual HTTP:
- Console `/healthz` 200.
- Console `/auth/session` 200, unauthenticated, `writesEnabled=false`, `sharedLoginEnabled=true`.
- Console unauthenticated `/api/runtime/workspaces` 401.
- Runtime `/ready` 200, MySQL and Runtime auth ready.
- Runtime anonymous `/api/runtime/projects` 401.
- Runtime anonymous `/api/runtime/me` 401.
- Console temporary diagnostics `/healthz/runtime` 404.

## Evidence separation / blockers

**PASS:** native principal-based identity endpoint code/unit CI; real Staging deployment; anonymous guard; scoped session proxy and write-gate code tests; independent browser interaction contract; real server-to-server data read from prior gate.

**NOT YET VERIFIED:** Issue an actual scoped identity for a real user, with role membership and authorized workspace; use that user's real credential in a live browser and verify who they are; validate revoke in deployed environment. Until this is done, do not label end-user RBAC E2E PASS.

**STILL BLOCKED:** Authorized file / artifact resolver and openability, true Staging edit-create-reload-audit E2E, all 15 AIGC stages with concrete Publish→Performance→Review→Next Round records, production-grade SSO/session scaling, production promotion.

## Security and release controls

- Production untouched, no merge or release authorization implied.
- No personal credential was created, guessed, logged, or transmitted in a public test.
- No production data was modified; Staging business data writes remain disabled.
- Runtime M31 pre-change rollback SHA: `cfc5f0a9ecf93c2871760a5691bea7d2b8204f4f`.
- Console pre-change rollback SHA: `d99d984b4addaaa33acb3157c8bdf63d6445693f`.

**Current human Gate: production identity provider and real user credential lifecycle; do not default to platform admin token as an end-user identity.**
