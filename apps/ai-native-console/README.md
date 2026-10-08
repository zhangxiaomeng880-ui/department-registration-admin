# AI Native 2.0 · Console — M31 Frontend Sync

**Status: implementation branch / NOT DEPLOYED / Frontend Real Binding Gate FAIL until live verification.**

An isolated staging-only workbench under the existing GitHub account, not the former City Service admin UI, chatgpt.site prototype, nor a production console. No mock/demo project records, localStorage business state, or fake success on buttons.

## Runtime bindings

- `GET /api/runtime/workspaces` — real workspaces.
- `GET /api/runtime/projects?workspaceId=...` — requires backend M31 project-list endpoint.
- `GET /api/runtime/projects/:id/lifecycle` — real stages/milestones/Gate references.
- `GET /api/runtime/projects/:id/stage-transitions` — recorded transitions.
- `GET /api/runtime/projects/:id/governance` and AIGC/Product domain — stored source data.
- `GET /api/runtime/workspaces/:id/audit-evidence` — M30 audit index snapshot (may be stale).
- `POST /api/runtime/projects` — real database insert, deliberately write-gated; refetch by ID.

All data is server-provided. AIGC stages come from lifecycle, 15 only when the bound workflow actually has 15 stages. Missing sources show an error or an empty state, never fabricated success. Stage PASS is **not** a direct toggle: requires run, Gate, checkpoint and idempotency evidence. Document opening remains explicitly blocked until an authorized file-serving contract exists.

## Staging configuration (SERVER ONLY)

```sh
cd apps/ai-native-console
export RUNTIME_API_BASE_URL="https://runtime-staging-rc1-staging.up.railway.app"
export RUNTIME_API_TOKEN="<staging-scoped credential or approved staging token>"
export CONSOLE_ADMIN_PASSWORD="<unique strong console password>"
export NODE_ENV=production
export CONSOLE_ALLOW_WRITES=false
npm start
```

For preview with approved test writes set `CONSOLE_ALLOW_WRITES=true` **only in staging**. The API token must never be prefixed with `VITE_` or sent to the browser. Sessions are single-instance memory only (restart invalidates sessions); behind HTTPS reverse proxy, `Secure; HttpOnly; SameSite=Strict` cookies are set. Separate enterprise SSO/RBAC and credential delegation are required before multi-tenant production use.

## Checks

```sh
npm run check
```

Gate conditions: staging deployment exists; BFF auth works; project list and lifecycle come from MySQL; create/refresh shows durable persistence; server Audit shows the actual action; artifacts link to authorized file service; all buttons that claim state change persist; no demo data. **Do not promote to production until all PASS.**
