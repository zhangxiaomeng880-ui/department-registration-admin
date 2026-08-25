# Design Stage — Structured Checklist V1.0

## 1. Purpose

将 Design 阶段纳入统一的结构化 Checklist / Validation / Gate 体系。Design 消费 Product Output，并产出可被 Engineering 与 QA 直接消费的设计资产。

## 2. Input Catalog

| ID | Name | Required | Validation | Evidence | Blocker | Status | Owner | Checked By | Checked At |
|---|---|---|---|---|---|---|---|---|---|
| DSN-IN-001 | PRD | Yes | 已定位、范围与核心需求完整 | Product Output | Yes | Pending | Design | - | - |
| DSN-IN-002 | Business Rules | Yes | 规则可理解、无关键冲突 | Product Output | Yes | Pending | Design | - | - |
| DSN-IN-003 | User Flow | Yes | 核心路径完整 | Product Output | Yes | Pending | Design | - | - |
| DSN-IN-004 | Acceptance Criteria | Yes | 可用于设计与后续 QA 对齐 | Product Output | Yes | Pending | Design | - | - |
| DSN-IN-005 | Product Decision Log | Yes | 关键决策与约束可追溯 | Product Output | No | Pending | Design | - | - |
| DSN-IN-006 | Open Questions / Warnings | Yes | 未决项已识别并明确影响 | Product Output | No | Pending | Design | - | - |

## 3. Design Process Checklist

| ID | Name | Required | Validation | Evidence | Blocker | Status | Owner | Checked By | Checked At |
|---|---|---|---|---|---|---|---|---|---|
| DSN-PR-001 | Information Architecture | Yes | 页面/信息层级完整且与需求一致 | Figma | Yes | Pending | Design | - | - |
| DSN-PR-002 | User Flow / Interaction Flow | Yes | 核心路径可完整走通 | Figma | Yes | Pending | Design | - | - |
| DSN-PR-003 | Interaction Design | Yes | 状态、反馈、异常与关键交互完整 | Figma | Yes | Pending | Design | - | - |
| DSN-PR-004 | Visual Design | Yes | 视觉层级、组件、间距、Typography 等符合设计规范 | Figma | Yes | Pending | Design | - | - |
| DSN-PR-005 | Responsive / Device Adaptation | Conditional | 按项目终端范围验证 | Figma / Device Spec | Yes | Pending | Design | - | - |
| DSN-PR-006 | Accessibility / Usability | Conditional | 按项目要求检查可用性与无障碍 | Design Spec | No | Pending | Design | - | - |
| DSN-PR-007 | Design Decision Record | Yes | 关键设计选择、依据与影响可追溯 | Design Decision Log | No | Pending | Design | - | - |

## 4. Output Catalog

| ID | Name | Required | Validation | Evidence | Blocker | Status | Owner | Checked By | Checked At |
|---|---|---|---|---|---|---|---|---|---|
| DSN-OUT-001 | Figma Design | Yes | 核心页面与状态完整，可定位 | Figma | Yes | Pending | Design | - | - |
| DSN-OUT-002 | Interaction Specification | Yes | 核心交互、状态、异常完整 | Figma / Spec | Yes | Pending | Design | - | - |
| DSN-OUT-003 | Visual Specification | Yes | 视觉细节可实现 | Figma / Spec | Yes | Pending | Design | - | - |
| DSN-OUT-004 | Component / Asset Mapping | Yes | 使用组件、资产与关键参数可追溯 | Figma / Design System | Yes | Pending | Design | - | - |
| DSN-OUT-005 | Design Decision Log | Yes | 关键判断有依据、有影响记录 | Git | No | Pending | Design | - | - |
| DSN-OUT-006 | Handoff Notes | Yes | Engineering 可理解实现边界与注意事项 | Git / Figma | Yes | Pending | Design | - | - |
| DSN-OUT-007 | Open Questions / Warnings | Yes | 未决事项、Owner、影响、下一步明确 | Git | No | Pending | Design | - | - |

## 5. Gate — Design Ready

### Pass
所有 Required 且 Blocker=Yes 的检查项通过。

### Pass with Warning
不存在 Blocker Missing/Fail，但存在非阻断 Warning；Warnings 必须随 Handoff 一并传递。

### Blocked
存在 Blocker Missing / Fail，或明确标记为 Blocker 的 Warning。

## 6. Downstream Contract

Design Output → Engineering Input：

- Figma Design
- Interaction Specification
- Visual Specification
- Component / Asset Mapping
- Handoff Notes
- Design Decision Log
- Open Questions / Warnings

Engineering 不应将未完成的探索稿当作 Design Ready 正式输入；探索可以并行，但必须明确标记为 Exploration。

## 7. Checklist Item Schema

所有 Design 检查项统一采用：

`ID / Name / Required / Validation / Evidence / Blocker / Status / Owner / Checked By / Checked At`

项目实例可以基于项目条件调整检查项，但不应直接修改 V1.0 Template；调整应进入 Checklist Change Log。
