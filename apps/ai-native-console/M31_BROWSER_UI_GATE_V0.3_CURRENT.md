# AI Native 2.0 · M31 Browser UI Gate V0.3 CURRENT

Date: 2026-10-08

## Results and evidence

| Gate | Status | Evidence |
|---|---|---|
| Runtime authenticated read / MySQL / primary Audit | PASS | GitHub Actions 37724478736 rerun #2 |
| Isolated Chromium interaction: login, project selection, AIGC asset ID/version display, Gate stages, Audit, refresh, reload, logout | PASS | GitHub Actions 37726702505 browser-contract |
| Real Staging login shell in Chrome desktop and mobile + anonymous 401 + writes disabled | PASS | GitHub Actions 37726702505 |
| New URL-based project navigation / back / deep-link reload (isolated browser) | PASS | GitHub Actions 37726640701, 37726702505 |
| New Staging UI deployment | SUCCESS | Railway c/o deployment 56c0caa9-b497-4ea2-bebf-893ab7762230 |
| Real Staging URL deep-link request | PENDING latest CI check | GitHub Actions 37726826312 (test extension) |
| Browser authenticated against real Railway Runtime | HOLD | No least-privileged end-user login credential |
| Real mutation after refresh | HOLD | CONSOLE_ALLOW_WRITES=false |
| Artifacts/PRD/QA external file provider can open | HOLD | No authorized file resolver/content-serving contract |
| AIGC full 15-stage Publish→Performance→Review→Next Round | HOLD | Not verified across real stored project records |
| Production promotion | NOT AUTHORIZED | No Production change |

## Work delivered

The workbench has independent addressable project views: `/projects/<project-id>/stages`, `/assets`, `/audit`, including history and hard refresh. AIGC asset cards are based on `GET /projects/:id/aigc-asset-system` and its real asset, version and requirement binding IDs. File refs may be registered in `contentLocator` but **do not become an openable link** absent a verified authorization and provider contract.

Frontend chromium tests use fixtures **only in CI**; fixture data is never copied into the application nor into Staging Runtime. Live network smoke tests are independent and work against the deployed Railway URL.

New staging Console source `d99d984b4addaaa33acb3157c8bdf63d6445693f`, committed in the isolated admin repo feature branch; Runtime remains at M31 branch `cfc5f0a9ecf93c2871760a5691bea7d2b8204f4f`. All 3 Staging services Online. Login is staging-only; direct Runtime tokens stay server-side. Console writes and public temporary authorized read probe are **disabled**.

## Remaining

Need scoped identity + role, browser authenticated real project E2E, authorized file provider connector, controlled staging write-and-restart persistence and audit, 15-stage end-to-end actual data check. Continue Gate-first and no mock substitutes. **Do not merge the draft as production-ready.**
