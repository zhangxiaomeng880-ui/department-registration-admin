# EVOLUTION-007 — Design Agent Stage Start

## Context
Product / PRD stage has completed its current Gate and its Output Contract is now the formal Design Input.

## Decision
Start the Design Agent using the shared Checklist Schema and low-token execution protocol.

## Design Input Contract
- PRD
- Product Gate result
- Business Rules
- User Flows
- Acceptance Criteria
- Product Decision Log
- Evidence Registry
- Project Design Checklist instance

## Agent Contract
`ai/agents/design/DESIGN_AGENT_PROMPT_V1.0.md`

## Rules carried forward
- Do not reload the full Knowledge Base.
- Read only required files or stable IDs.
- Keep checklist configuration project-specific without mutating the template.
- Record project-level checklist changes.
- Preserve FR / BR / AC traceability.
- Block on required blocker inputs; carry non-blocking warnings forward.

## Expected Output
A Design Output Contract sufficient for Engineering Input, including applicable information architecture, interaction flows, states, visual design, component/asset mapping, handoff notes, decisions, evidence, and open questions.

## Next checkpoint
Run the Design Input Checklist first. Do not treat Design as Ready until the Design Gate passes.
