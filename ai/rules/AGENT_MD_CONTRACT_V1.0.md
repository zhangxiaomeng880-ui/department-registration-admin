# AGENT MD Contract V1.0

This is the mandatory common execution contract for every Agent MD. Process Agents own lifecycle Phases; Capability Agents provide reusable specialist capability.

## Mandatory execution contract

Every Agent MD MUST define identity, responsibility, non-responsibility, trigger, owner phase when applicable, input, validation, context, classification, capability detection, execution strategy, model selection, execution, HITL, output, evidence, quality gate, handoff, state, parallel task, reuse, token/cost, audit, and knowledge handoff.

## Input / validation

Inputs consist of System Context, Task Input, User Input and previous valid Outputs. Existing valid context must not be requested again. Critical facts must not be guessed. Validate completeness, validity, consistency, freshness, provenance and executability. Missing critical input → `WAITING_FOR_INPUT`; user choice required → `USER_DECISION_REQUIRED`.

## Task / capability classification

Tasks may be Information Retrieval, Information Organization, Analysis / Judgment, Decision Support, Content Generation, Action / Execution, or Verification / Audit. Detect reusable capabilities before execution. Optional specialist capabilities require authorization.

## Common Capability Pool

`TOOL`, `USER_MCP`, `USER_SKILL`, `CAPABILITY_AGENT`, and `MODEL` are common capability types, not additional lifecycle Agents. MCP selection verifies authorization, task compatibility, schema, availability, and applicable cost / latency / audit requirements. User Skills must be applicable and respect higher-priority rules.

## Execution

```text
Task → Classification → Capability Detection → Registry → Tool / MCP / Skill / Capability Agent / Model Selection → Execution
```

The Phase invokes its owning Process Agent. Dynamic Model Routing is a common-runtime concern and must not be duplicated inside individual Agents.

## Model selection

Every Model Run records Model / Version, selection reason, token usage, cost, latency, retry, escalation and quality where available. Optimize for Quality-Constrained Minimum Cost.

## Execution trace

Every Task is decomposable into traceable Steps: `Task → Input Validation → Context Assembly → Classification → Capability Detection → Selection → Execution → Quality Check → Output → Handoff`. Material Tool / MCP / Skill / Capability / Model executions must be traceable to Task and Step IDs.

## Human Review

Standard states include `WAITING_FOR_INPUT`, `USER_DECISION_REQUIRED`, `USER_CONFIRMATION_REQUIRED`, `USER_APPROVAL_REQUIRED`. Review responsibility is governed by `ai/rules/REVIEW_RESPONSIBILITY_MATRIX_V1.0.md`. `HUMAN_REVIEW_REQUIRED` items create a `HumanReviewTask`; unresolved required tasks block Phase Handoff.

## Output / Handoff

Every Process Agent MUST provide a versioned Phase Output as the primary downstream boundary. Handoff preserves provenance, decisions, constraints, unresolved items, required next inputs and readiness. Handoff requires applicable Quality, Compliance, Independent Audit and Human Review gates. Automatic next-Phase progression requires an explicit Project Rule; otherwise user confirmation is required.

## Evidence / Quality / Audit

Material conclusions identify evidence and distinguish Fact, Finding, Hypothesis, Recommendation and Decision. Every Agent / Phase defines Input, Execution, Output, Evidence and Handoff Quality with `PASS / PARTIAL / BLOCKED / FAIL`. Independent Audit is separate from Testing, Compliance and Review. An Agent must not self-certify its independent Audit; only `AUDIT_PASS` is formally acceptable.

## State / Parallel / Reuse / Cost

Task lifecycle: `CREATED → INPUT_CHECK → [WAITING_FOR_INPUT / USER_DECISION_REQUIRED] → EXECUTING → QUALITY_REVIEW → COMPLETED`, with `PARTIAL / BLOCKED / FAILED / SKIPPED` exceptions. Independent Tasks keep isolated records. Reuse only valid, compatible, sufficiently current artifacts. Usage is traceable as `Project → Phase → Task → Step → Tool / MCP / Skill / Model Run`.

## Authoritative references

- `ai/rules/PHASE_CONTRACT_V1.1.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.1.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
- `ai/rules/REVIEW_RESPONSIBILITY_MATRIX_V1.0.md`
- `ai/schemas/phase/human-review-task.schema.yaml`
