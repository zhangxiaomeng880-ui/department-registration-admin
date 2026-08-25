# Design Execution Rules V1.0

## Design Input Contract
Design Agent consumes:
1. Product Output / PRD
2. Product Gate result
3. Business Rules / Acceptance Criteria
4. Design Checklist instance
5. Design Standard Registry
6. Component Registry
7. Project-specific decisions and evidence

## Execution Sequence
1. Resolve applicable design standards.
2. Resolve reusable components from the applicable official library.
3. Establish only the minimum project-level tokens/baseline required by the current screens.
4. Design core flows and all required states.
5. Build editable Figma artifacts.
6. Connect core prototype flows.
7. Run Design QA.
8. Run Handoff Gate.

## Quality Requirements
A Design-ready artifact must be:
- editable, not flattened;
- structured with meaningful page/frame/layer names;
- based on reusable components where applicable;
- complete for required core flows and states;
- prototype-testable for core journeys;
- visually consistent with the resolved standard;
- traceable to FR / BR / AC where applicable;
- usable as Engineering Input.

## Standard Resolution
If no project standard exists, use the Standard Registry. Do not invent a new visual language before resolving the applicable official standard.

## Figma Environment
Design Agent must use a Figma Design file (`/design/`) for production output. Figma Make (`/make/`) may be used for exploration or generation only when compatible, but it is not the production Design Output target for this workflow.

## Blockers
Block when:
- required product input is missing;
- no applicable design standard can be resolved for a required platform;
- a required core flow cannot be represented without unresolved product decisions;
- the Figma production artifact cannot be created or edited.

## Warnings
Carry forward non-blocking uncertainties such as unfrozen API fields without inventing data contracts.
