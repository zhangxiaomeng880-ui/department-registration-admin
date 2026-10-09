# GitHub Project State Mapping

GitHub Project is a collaboration and state-management layer. It is not the AI Native Phase execution lifecycle and must not be used as a substitute for Phase Contracts or Agent orchestration.

## Layer Boundary

```text
Project Lifecycle / Collaboration Layer
        │
        ├── Issue
        ├── Project state
        ├── Repository / PR
        └── Release / Analytics references

AI Native Delivery Phase Lifecycle
        │
        ├── Research
        ├── Opportunity
        ├── Product
        ├── Design
        ├── Planning
        ├── Coding / Engineering
        ├── Testing
        ├── Release / Deploy
        └── Maintenance / Iteration

Cross-Phase Assurance
        ├── Quality Gate
        ├── Compliance Gate (when applicable)
        └── Independent Audit Gate
```

## Project States

Project states are collaboration/status indicators and do not define Agent execution order.

| Project State | Purpose | Typical evidence |
|---|---|---|
| Requirement | New requirement / intake | Issue |
| In Progress | Active work in the current Phase | Task / execution record |
| Blocked | Work cannot proceed | Blocker / decision record |
| Review | Human or quality review pending | Artifact / review record |
| Ready | Current Phase complete and next Phase may be started | Phase Output + Gates |
| Released | Release completed | Release record |
| Done | Project objective / work item closed | Final artifact + closure evidence |

The exact Project state names may differ by GitHub Project configuration. The AI Native Phase is stored separately as authoritative execution state.

## Phase State

The authoritative Phase lifecycle follows the Phase Contract, not the GitHub Project state field:

```text
Configured Delivery Phase
        ↓
Input Readiness
        ↓
Execution
        ↓
Phase Output
        ↓
Quality Gate
        ↓
Compliance Gate (if applicable)
        ↓
Independent Audit Gate
        ↓
Phase Handoff
        ↓
Next Configured Delivery Phase
```

Project state is updated from the Phase lifecycle; it does not determine whether a Phase has passed its Gate.

## Canonical Phase Names

- Research
- Opportunity
- Product
- Design
- Planning
- Coding / Engineering
- Testing
- Release / Deploy
- Maintenance / Iteration

Do not introduce `QA` as a second Phase name for Testing. `QA` may be used as an implementation/team label only.

Do not introduce `Ready` as a Delivery Phase. `Ready` is a Project collaboration state representing readiness for the next configured Phase.

## Entry and Handoff

A new product request normally enters through an Issue / Requirement Intake. The first Delivery Phase is selected by Project configuration and readiness rules; it is not hard-coded as Project → Research.

A Phase may start only when its required Input and Readiness conditions are satisfied.

A Phase is complete only after its required Quality Gate and applicable Compliance Gate and Independent Audit Gate have passed. The approved Phase Output becomes the primary input boundary for the next Phase.

## Traceability

Issue, Phase, Artifact, Task, Execution Record, PR, Release, and Analytics records should cross-reference one another where applicable.

Project status must never be treated as proof of execution quality, compliance, or audit approval.
