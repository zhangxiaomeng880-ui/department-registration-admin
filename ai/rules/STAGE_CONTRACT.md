# Stage Contract Compatibility Profile V1.0

> **Compatibility notice:** This file is retained only for backward compatibility with legacy Testing / Compliance references. It is NOT a competing lifecycle contract.
>
> The authoritative lifecycle contract is `ai/rules/PHASE_CONTRACT_V1.1.md` and the authoritative Agent execution contract is `ai/rules/AGENT_MD_CONTRACT_V1.0.md`.

## 1. Authority

All lifecycle stages / phases MUST follow:

1. `AGENT_MD_CONTRACT_V1.0.md` for Agent execution semantics;
2. `PHASE_CONTRACT_V1.1.md` for Phase orchestration;
3. `EXECUTION_RECORD_CONTRACT_V1.0.md` for execution traceability;
4. `CAPABILITY_REGISTRY_V1.0.md` for capability selection.

This compatibility profile MUST NOT introduce a second Input / Execution / Output / Gate / Handoff framework.

## 2. Legacy Stage Semantics

Legacy documentation may use the term `Stage`. In AI Native 2.0, lifecycle orchestration uses `Phase` as the canonical term.

Where a legacy Stage reference is encountered:

`Stage → Phase`

The owning Process Agent remains the authority for professional execution.

## 3. Shared Execution Semantics

Every Phase follows:

`Input → Readiness → Process Agent → Capability Selection → Execution → Output → Quality Gate → Required Independent Audit → Phase Output → Handoff`

Execution Records and business Output Artifacts remain separate.

## 4. Capability Pool

`TOOL / USER_MCP / USER_SKILL / CAPABILITY_AGENT / MODEL`

Capability selection follows the Capability Registry. Availability alone is never a reason to invoke a capability.

## 5. Testing-specific Compatibility Notes

Testing remains responsible for functional / quality verification. Its detailed lifecycle is maintained by `ai/agents/testing/AGENT.md` and `ai/schemas/testing/`.

Testing must retain the closed loop:

`Readiness → Test Planning → Test Case Generation → Test Case Audit → Test Execution → Issue → Fix → Preview/Self-Test → Retest → Regression → Test Report → Report Audit → Testing Gate → Handoff`

Test Case Audit and Report Audit must be independent from Testing execution.

## 6. Compliance-specific Compatibility Notes

Compliance remains responsible for rule conformance. Its detailed lifecycle is maintained by `ai/agents/compliance/AGENT.md`.

Compliance PASS does not imply Testing PASS or Audit PASS.

## 7. Independent Audit

Audit remains independent from Testing, Compliance, and the audited Process Agent.

Audit must use `ai/agents/audit/AGENT.md` and the authoritative contracts above. Audit Agent itself is independently auditable.

## 8. Handoff

The approved `Phase Output` is the canonical downstream input. Legacy Stage Output references must be interpreted as Phase Output references and must not create a parallel handoff model.

## 9. Migration Rule

When legacy Stage documentation conflicts with the authoritative Phase / Agent contracts, the authoritative contracts win. Legacy references must be migrated when touched.

## 10. Contract References

- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/PHASE_CONTRACT_V1.1.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
- `ai/agents/testing/AGENT.md`
- `ai/agents/compliance/AGENT.md`
- `ai/agents/audit/AGENT.md`
