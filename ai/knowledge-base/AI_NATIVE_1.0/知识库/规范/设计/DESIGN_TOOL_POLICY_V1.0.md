# Design Tool Policy V1.0

## Decision
Penpot is the primary design execution tool for this project's Design Agent.

## Why
Penpot supports editable UI design, interactive prototypes, reusable components, libraries, design tokens, responsive Flex/Grid layouts, code inspection, and open formats. Its official MCP Server enables an AI agent to read and modify pages, layers, components, styles, and tokens. See official sources:
- https://penpot.app/
- https://help.penpot.app/mcp/
- https://help.penpot.app/user-guide/design-systems/
- https://help.penpot.app/user-guide/prototyping-and-testing/

## Execution Rules
1. Penpot is the production Design Output target for this project.
2. Figma is no longer the primary execution target for this project, but existing Figma artifacts may remain as references.
3. The Design Agent must use Penpot-editable artifacts, not flattened screenshots, as the Design Output.
4. Design Standard and Component citations remain mandatory and must record official source ID/URL/version when applicable.
5. Project-level design inputs remain human-confirmed hints; missing hints do not become invented requirements.
6. Design Checklist remains project-configurable.
7. Design Quality Gate must validate editability, structure, component reuse, core flow coverage, states, prototype behavior, visual consistency, and engineering handoff.

## Penpot Execution Environment
Preferred deployment: Penpot Cloud. Self-hosted Penpot is an approved alternative when the project requires controlled infrastructure.

## Agent Integration
Preferred agent path: Penpot MCP Server. The official documentation states that Penpot MCP can read and modify design file structure, components, styles, tokens, pages, and layers, and can support design-to-design, design-to-code, and maintenance workflows.

## Standard Resolution
The active design standard policy remains:
1. Project-specific active standard
2. Official platform guidelines
3. Official open-source design systems
4. Other references only if explicitly approved

## Output Contract
Design Output must include a Penpot file/link plus applicable:
- Information Architecture
- Interaction Flow
- Visual Design
- States
- Components / Libraries
- Prototype
- Design Decision Log
- Evidence / Standard References
- Handoff Notes
