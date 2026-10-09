# Requirement → Delivery Phase AI Native Workflow

This workflow describes the AI Native delivery lifecycle. GitHub Issue is the normal requirement-intake mechanism, while GitHub Project remains a collaboration/state layer and does not define Phase execution order.

## 0. Requirement Intake

**Input:** user request, business goal, data anomaly, or user feedback.

**AI:** clarify the problem, collect missing context, and identify readiness gaps.

**Human:** confirm whether the request should enter the product lifecycle.

**Output:** Requirement / Issue record.

Requirement Intake is an entry point, not a Delivery Phase.

---

## Delivery Phase Lifecycle

The first Delivery Phase is selected by project configuration and readiness rules. It is not hard-coded as Project → Research.

### 1. Research

Collect and organize relevant facts: user feedback, behavioral data, competitors, industry evidence, and historical solutions.

**Output:** Research Note / research artifact.

### 2. Opportunity

Transform validated research into:

- user problems;
- business problems;
- opportunities;
- hypotheses to validate;
- success measures.

**Human:** confirm the problem and opportunity definition.

**Output:** Opportunity Definition.

### 3. Product

Produce the authoritative product definition, including:

- User Story;
- scenarios;
- business rules;
- scope / non-scope;
- exceptions;
- acceptance criteria.

**Human:** confirm product decisions and trade-offs.

**Output:** Versioned PRD.

### 4. Design

Translate the approved product definition into information architecture, interaction, visual design, and applicable design-system resources.

**Output:** Approved Design Assets / Design Specification.

**Gate:** Design must remain consistent with the approved product rules.

### 5. Planning

Translate approved Product and Design outputs into executable engineering tasks, dependencies, impact scope, acceptance criteria, and test scope.

**Output:** Engineering Plan / Tasks.

### 6. Coding / Engineering

Implement the approved plan in the existing repository.

Requirements:

1. Read applicable rules and existing implementation before modification.
2. Prefer incremental changes.
3. Do not silently change approved product logic.
4. Escalate high-impact architecture or data-model changes.

**Output:** Branch / Commit / Pull Request / Engineering Artifact.

### 7. Testing

Testing independently verifies functional behavior against approved requirements and engineering expectations, including:

- normal flows;
- boundary conditions;
- exception flows;
- regression impact;
- frontend/backend integration;
- applicable preview/runtime verification.

**Output:** Test Report / Evidence.

Testing PASS does not imply Compliance PASS or Audit PASS.

### 8. Release / Deploy

Release starts only after required engineering, Testing, Compliance (when applicable), Quality, and Independent Audit gates have passed.

Confirm:

- approved product scope;
- reviewed PR;
- required tests passed;
- release scope;
- deployment/environment readiness;
- rollback strategy.

**Output:** Release Record / Version.

### 9. Maintenance / Iteration

After release, monitor runtime behavior, user feedback, incidents, metrics, and operational issues. Material findings may create a new Requirement Intake or enter a configured follow-up Phase.

**Output:** Maintenance Record / Analysis / New Requirement when applicable.

---

## Cross-Phase Gates

Quality, Compliance, and Audit are not interchangeable:

```text
Current Delivery Phase
        ↓
Phase Output
        ↓
Quality Gate
        ↓
Compliance Gate (when applicable)
        ↓
Independent Audit Gate
        ↓
Phase Handoff
        ↓
Next Configured Delivery Phase
```

- **Testing / QA:** verifies product and technical behavior.
- **Compliance:** verifies applicable rules, policies, constraints, and required evidence.
- **Audit:** independently verifies process integrity, evidence, conclusions, and Gate correctness.

Audit must not be performed or self-certified by the Agent being audited.

## Traceability

The lifecycle should maintain references among Requirement, Phase, Artifact, Task, Execution Record, Decision Record, PR, Release, and Analytics records where applicable.

The approved Phase Output is the primary input boundary for the next Phase.

## Closed Loop

```text
Requirement Intake
      ↓
Configured Delivery Phase Lifecycle
      ↓
Release / Deploy
      ↓
Maintenance / Iteration
      ↓
New Requirement Intake when a material follow-up is identified
```
