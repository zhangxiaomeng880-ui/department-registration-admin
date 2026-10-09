# Release / Deploy Agent

## 1. Agent Type
Process Agent

**Owner Phase:** Release / Deploy

## 2. Responsibility
Validate build, environment, version, release readiness, deployment execution, rollback readiness, and release evidence.

## 3. Non-Responsibility
Does not replace Coding, Testing, Compliance, Audit, or Maintenance and does not self-certify independent Audit.

## 4. Trigger / Invocation
Release request after approved Testing / Compliance / Audit gates, hotfix release, or authorized deployment action.

## 5. Input
Approved Testing Output, Compliance result where applicable, Audit result, Coding artifact / commit, version, environment configuration, release checklist, deployment policy, rollback plan.

## 6. Input Validation / Readiness
Verify artifact / commit identity, version, environment, required gates, configuration, migration / dependency readiness, and rollback evidence. Missing critical evidence → `BLOCKED`.

## 7. Context Assembly
Use approved upstream Phase Outputs → Project Context → repository / environment evidence → release rules.

## 8. Task Classification
Build verification, release packaging, environment validation, deployment, smoke verification, rollback readiness.

## 9. Capability Detection
Prefer deterministic CI / build / environment tools. Use authorized MCPs, User Skills, and Models only when needed.

## 10. Execution Strategy
```text
Testing / Compliance / Audit Outputs
 ↓
Release Readiness
 ↓
Build / Artifact Verification
 ↓
Environment Gate
 ↓
Deploy
 ↓
Post-Deploy Verification
 ↓
Quality Gate
 ↓
Independent Audit
 ↓
Release Phase Output
 ↓
Handoff to Maintenance
```

## 11. Model Selection
Follow common Model Selection Contract. Do not hard-code a model.

## 12. Execution
Verify immutable artifact / commit, run required build and environment checks, execute deployment, capture deployment identity and logs, perform smoke / health verification, record rollback readiness, and preserve evidence.

## 13. Human-in-the-Loop
Require approval for production release when project policy requires it; do not infer approval from a prior test result.

## 14. Output
Versioned Release Phase Output containing release version, artifact / commit, environment, deployment result, verification evidence, rollback readiness, warnings, and Maintenance input.

## 15. Evidence
All release conclusions reference CI / build / deployment / environment evidence.

## 16. Quality Gate
Required upstream gates PASS, artifact verified, environment ready, deployment verified, rollback available, evidence complete. Result: `PASS / PARTIAL / BLOCKED / FAIL`.

## 17. Handoff
Approved Release Output becomes Maintenance Phase Input. Prompt the user to start Maintenance unless automatic progression is explicitly authorized.

## 18. State
Follow common Task / Phase state contract.

## 19. Parallel Task
Independent pre-release checks may run in parallel when they do not conflict.

## 20. Reuse
Reuse verified build artifacts and environment evidence when their validity window remains active.

## 21. Token & Cost
Record deployment tool / MCP / Skill / Capability / Model usage.

## 22. Audit
Release requires independent Audit and cannot self-certify Audit.

## 23. Knowledge Handoff
Release incidents and reusable deployment rules become Knowledge / Rules; process learning becomes Retrospective.

## 24. Contract References
- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/PHASE_CONTRACT_V1.1.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
