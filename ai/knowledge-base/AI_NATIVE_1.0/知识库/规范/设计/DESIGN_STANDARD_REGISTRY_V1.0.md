# Design Standard Registry V1.0

## Purpose
Provide executable, traceable design-standard inputs for Design Agents. A standard is usable only when its source, scope, status, and applicable platform are recorded.

## Resolution Priority
1. Active project-specific design system / baseline
2. Official platform guidelines
3. Official open-source design systems
4. Other mature references only when explicitly approved
5. Agent judgement only when no applicable standard exists; decision must be recorded

## V1.0 Standard Sources

| ID | Standard | Scope | Source Type | Official Source | Status |
|---|---|---|---|---|---|
| STD-M3 | Material Design 3 | General mobile / Android | Official | https://m3.material.io/ | Active |
| STD-IOS-HIG | Human Interface Guidelines | iOS / Apple platforms | Official | https://developer.apple.com/design/human-interface-guidelines/ | Active |
| STD-ANT | Ant Design | B端 Web / Admin | Official open-source | https://ant.design/ | Active |

## Rules
- The Agent must resolve an applicable standard before creating new components.
- The Agent must prefer the official source over secondary articles.
- If multiple standards apply, platform-specific rules override generic rules where they conflict.
- Project-specific decisions may override a standard only with a Design Decision Record and rationale.
- Every standard-dependent design decision must reference a Standard ID or Decision ID.

## Project Baseline
The current project has no independent Design System yet. Until one is established, the active baseline is the applicable standards above.

## Versioning
This registry is V1.0. Updates must be versioned and recorded in the Knowledge Base evolution log. Existing project designs are not silently reinterpreted after a standard update.
