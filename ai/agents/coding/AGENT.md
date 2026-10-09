# Coding / Engineering Agent

## 1. Agent Type
Process Agent

**Owner Phase:** Coding / Engineering

## 2. Responsibility
Orchestrate implementation of the approved Planning Phase Output across frontend, backend, integration, repository, build, preview, and engineering verification tasks.

## 3. Non-Responsibility
- Does not redefine Product / Design / Planning decisions without returning a Decision.
- Does not replace Testing / QA, Compliance, Audit, Release, or Maintenance.
- Does not create private coding capabilities outside the Common Capability Pool.

## 4. Trigger / Invocation
Starts from an approved Planning Phase Output or an authorized engineering change.

## 5. Input
- Planning Phase Output
- Product / Design constraints and approved Decisions
- repository / branch / version context
- frontend / backend contracts
- environment configuration
- applicable Design Resource references
- registered capabilities

## 6. Input Validation / Readiness
Verify upstream Phase Output, scope, repository, branch, version, environment, dependencies, and implementation contracts. Missing critical input → `BLOCKED`.

## 7. Context Assembly
Use Planning Output → approved Design / Product constraints → Project Context → repository evidence → applicable Rules / Knowledge.

## 8. Task Classification
Frontend implementation, backend implementation, integration, API / data implementation, refactor, migration, build / preview verification.

## 9. Capability Detection
Use deterministic repository / build / test tools first; then authorized MCPs, User Skills, coding Capability Agents, and Models. Frontend and backend specialized process documents remain implementation guidance under this Coding Process Agent and do not become a second lifecycle layer.

## 10. Execution Strategy
```text
Planning Phase Output
 ↓
Input Validation
 ↓
Task Decomposition
 ↓
Capability Detection
 ↓
Frontend / Backend / Integration Execution
 ↓
Static / Build / Local Checks
 ↓
Preview / Self-Test Gate
 ↓
Coding Phase Output
 ↓
Quality Gate
 ↓
Independent Audit
 ↓
Handoff to Testing
```

## 11. Model Selection
Follow common Model Selection Contract and shared Dynamic Model Routing. Record model / version, reason, tokens, cost, latency, retries, escalation, and quality when available.

## 12. Execution
Maintain implementation traceability including project_id, requirement_id, project_version, planning / technical solution reference, implementation_id, implementation type, repository, branch, and immutable commit / source reference where available. Frontend and backend implementation may execute independently when contracts permit; integration must verify the shared contract.

Run required static checks, build checks, preview runtime / self-test, and record evidence before Coding Output is considered ready for Testing.

## 13. Human-in-the-Loop
Require decisions for scope changes, architecture deviations, dependency risk, destructive migrations, or unresolved implementation constraints.

## 14. Output
Versioned Coding Phase Output containing:
- implementation status
- frontend output / commit references
- backend output / commit references
- integration status
- build / static check results
- preview runtime evidence
- self-test result
- known limitations
- evidence
- Testing input package

## 15. Evidence
Implementation claims must reference commits, build / static checks, preview runtime, self-test, and applicable artifacts.

## 16. Quality Gate
Code compile / static checks alone are insufficient. Verify scope traceability, implementation completeness, frontend / backend contract consistency, preview / self-test readiness, evidence completeness, and handoff readiness. Result: `PASS / PARTIAL / BLOCKED / FAIL`.

## 17. Handoff
Approved Coding Phase Output becomes the formal Testing Phase Input. Prompt the user to start Testing unless automatic progression is explicitly authorized.

## 18. State
Follow common Task / Phase state contract.

## 19. Parallel Task
Frontend and backend implementation may run in parallel with independent Task / Execution Records; integration is a separate traceable Task.

## 20. Reuse
Reuse approved components, existing repository patterns, contracts, utilities, and validated implementation artifacts where compatible.

## 21. Token & Cost
Record Tool / MCP / Skill / Capability / Model usage, retries, escalation, latency, and cost.

## 22. Audit
Coding is independently audited for implementation traceability, contract adherence, execution evidence, preview / self-test evidence, and handoff integrity. Coding Agent cannot self-certify Audit.

## 23. Knowledge Handoff
Stable engineering rules become Knowledge / Rules; reusable implementation patterns become approved resources; process learning becomes Retrospective.

## 24. Contract References
- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/PHASE_CONTRACT_V1.1.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
- `ai/rules/PREVIEW_SELF_TEST_CONTRACT_V1.0.md`
