# AI Native 2.0 · M31 Information Architecture & Route Gate V0.5 CURRENT

Date: 2026-10-08
Status: IMPLEMENTED / CI PASS / STAGING DEPLOY STAGED ONLY / FRONTEND REAL BINDING FULL GATE HOLD

## Navigation architecture

- **Global navigation** is a stable workspace sidebar with distinct addressable screens:
  - `/projects` — 项目总览: genuine Runtime/MySQL project listing, type filters, project selection.
  - `/capabilities` — 资源能力池: `GET /api/runtime/capabilities`; platform-admin-only registry returns a real authorization failure for scoped users without access, rather than fabricated capabilities.
  - `/knowledge` — 知识库: select a real project and read `GET /api/runtime/projects/:id/knowledge-bindings`; no fake all-provider file index.
- **Project workspace** is a separate addressable route: `/projects/:projectId/overview`.
  Tabs each have real URLs: `overview`, `tasks`, `assets`, `data`, `stages`, `audit`.
  `/projects/:projectId` resolves to project overview.
- **Object detail**:
  - `/projects/:projectId/tasks/:taskId`: exactly the matching `getProjectGovernance().workItems[].id`.
  - `/projects/:projectId/assets/:assetId`: exactly the matching `getAigcAssetState().assets[].id`, with version IDs from the same real source.
- **Navigation**: HTML links, SPA navigation via History API, browser back/forward, full-page refresh (server route fallback), direct-share URLs. No localStorage business caches.

## Source-of-truth controls

- Projects: `GET /api/runtime/projects?workspaceId=...`.
- Milestones, tasks, risks and overview counts: `GET /api/runtime/projects/:id/governance`.
- Stages and Gate IDs: `GET /api/runtime/projects/:id/lifecycle`.
- Asset and version facts: `GET /api/runtime/projects/:id/aigc-asset-system`.
- Audits: original `audit-events` and possibly stale M30 audit index remain visibly separate.
- No authoritative file-serving resolver yet; registering file ID does **not** enable an 'open/download' control.
- Missing endpoint, read privilege or object returns an honest unavailable/empty state.

## CI and deployment boundary

- Pinned implementation SHA: `934020e6a2e63e0612357f7e1fb8e7c0b6cd087b`.
- Frontend CI `37728931418` and `37728935950`: PASS.
- Chromium tests: authentic page/navigation semantics with isolated fixture backend only, plus separate existing live Staging anonymous login shell test. **No claim of production-data browser login**.
- Railway Staging patch `8a1710e0-82e4-4e04-8ed3-5332dd6c43ff` is **STAGED**, 1 non-destructive console source-commit update. **NOT APPLIED / NO STAGING DEPLOY YET** for V0.5.
- Previous Staging Runtime and MySQL not changed by this UI-only patch. Production not changed.
- User approval is required before actually committing this pending Railway deploy.

## Still HOLD

Scoped end-user identity provisioning and live login, create→reload→audit E2E, authorized PRD/QA/media file-open service, 15-stage AIGC Publish→Performance→Review→Next Round data-level check, security review and final production promotion.
