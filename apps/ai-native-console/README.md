# AI Native 2.0 · Console — M31 Frontend Sync

**Status: Staging deployed / read-only API + anonymous browser shell verified; full Frontend Real Binding Gate remains HOLD. Production unchanged.**

An isolated staging-only workbench under the existing GitHub account, not the former City Service admin UI, chatgpt.site prototype, nor a production console. No mock/demo project records, localStorage business state, or fake success on buttons.

## Runtime bindings

- `GET /api/runtime/workspaces` — real workspaces.
- `GET /api/runtime/projects?workspaceId=...` — requires backend M31 project-list endpoint.
- `GET /api/runtime/projects/:id/lifecycle` — real stages/milestones/Gate references.
- `GET /api/runtime/projects/:id/stage-transitions` — recorded transitions.
- `GET /api/runtime/projects/:id/governance` and AIGC/Product domain — stored source data.
- `GET /api/runtime/workspaces/:id/audit-evidence` — M30 audit index snapshot (may be stale).
- `POST /api/runtime/projects` — real database insert, deliberately write-gated; refetch by ID.

All data is server-provided. AIGC stages come from lifecycle; the stage screen verifies the bound template identity and exact 15 stage Keys and sequence numbers 1–15, marking missing/duplicated/misordered sequences as NOT PASSED. The result is a **structure-only** check, not a claim that individual Gates, execution, publishing, analytics, or a real Staging AIGC project have passed. Missing sources show an error or an empty state, never fabricated success. Stage PASS is **not** a direct toggle: requires run, Gate, checkpoint and idempotency evidence. Document opening uses the separately gated S3-compatible `/access` → `/content` resolver for personal scoped identities only; actual Staging file positive E2E remains HOLD without a rights-approved real object.

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

For a separately authorized Staging-only mutation gate, `CONSOLE_ALLOW_WRITES=true` alone is not sufficient: the logged-in identity also needs explicit `project:write` scope. Current Staging writes remain OFF. The API token must never be prefixed with `VITE_` or sent to the browser. Sessions are single-instance memory only (restart invalidates sessions); behind HTTPS reverse proxy, `Secure; HttpOnly; SameSite=Strict` cookies are set. Separate enterprise SSO/RBAC and credential delegation are required before multi-tenant production use.

## Checks

```sh
npm run check
```

Gate conditions: staging deployment exists; BFF auth works; project list and lifecycle come from MySQL; create/refresh shows durable persistence; server Audit shows the actual action; artifacts link to authorized file service; all buttons that claim state change persist; no demo data. **Do not promote to production until all PASS.**

## M31 AIGC 15-stage structure-only verification

- Authoritative stage keys and order: `src/domain-workflow-presets.mjs` backend preset `AIGC_CONTENT_STANDARD` V2.4 (15 keys from `AIGC_00_INIT` to `AIGC_14_REVIEW`, sequence 1–15).
- Frontend `public/app.js` compares the **actual Runtime `project.workflowTemplateId` and `/lifecycle.stages`** to that exact shape. It is fail-closed for missing template, missing stages, wrong counts, duplicates, wrong keys, wrong positions and off-sequence numbering.
- Browser fixture tests: partial 2/15 → not passed, duplicate 15/15 → not passed, exact ordered 15 → structure passed; **fixture tests are not evidence of a live Staging workflow**.
- Live Staging still needs a real bound AIGC project and authorized browser session to confirm 15/15 plus later publishing/performance/review, before the corresponding real-data Gate can PASS.
