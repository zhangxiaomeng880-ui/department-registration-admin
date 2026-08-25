# EVOLUTION-009 — Design Standards and Figma Environment

## Decision
Design V1.0 will use official/open-source standards and component libraries as the executable design baseline.

## Standard Sources
- Material Design 3 for general mobile / Android contexts
- Apple Human Interface Guidelines for iOS-specific behavior
- Ant Design for B端 Web / Admin

## Registry
- `ai/knowledge-base/v1.0/design/DESIGN_STANDARD_REGISTRY_V1.0.md`
- `ai/knowledge-base/v1.0/design/COMPONENT_REGISTRY_V1.0.md`
- `ai/knowledge-base/v1.0/design/DESIGN_EXECUTION_RULES_V1.0.md`

## Figma Environment Finding
The previously supplied file was a Figma Make file (`/make/`). It was not actually missing. The limitation is file type: the production design tooling used by this workflow requires a standard Figma Design file (`/design/`) for editable UI production and library/component operations. Therefore the Make file should not be treated as the production Design Output target.

## New Production Design File
A standard editable Figma Design file was created for this project:
`https://www.figma.com/design/3QnOpmgasqSd9D2c66XOyg`

File name: `科室挂号 Design V1.0`

## Quality Principle
Exploration and process validation may occur in Make, but the Design stage's final deliverable must be an editable, structured, prototype-testable Figma Design file that can serve as Engineering Input.

## Token Principle
Only the registries and execution rules required by the current Design stage should be loaded; the entire Knowledge Base should not be reloaded.
