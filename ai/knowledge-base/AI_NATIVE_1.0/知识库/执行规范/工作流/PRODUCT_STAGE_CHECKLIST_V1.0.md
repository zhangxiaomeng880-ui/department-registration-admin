# Product Stage — Structured Checklist V1.0

## 1. Purpose

将 Product 阶段从阶段描述升级为可执行的结构化检查目录。Product 消费 Project Output，并产出可被 Design、Engineering、QA 继续消费的标准资产。

## 2. Input Catalog

| ID | 检查项 | Required | Validation | Evidence | Blocker |
|---|---|---:|---|---|---:|
| P-IN-001 | Project Goal 已明确 | Yes | 可定位且无关键歧义 | Project Brief | Yes |
| P-IN-002 | Scope / Out of Scope 已明确 | Yes | 边界可被执行理解 | Project Output | Yes |
| P-IN-003 | 关键约束与依赖已登记 | Yes | 有记录；未知项可标记待确认 | Constraint Registry | Yes |
| P-IN-004 | 关键 Evidence 可追溯 | Yes | 来源、时间/版本、摘要可定位 | Evidence Registry | Yes |
| P-IN-005 | 历史 Knowledge / 相似项目已检查 | Yes | 已检索或明确 N/A 及原因 | Knowledge Base | Warning |
| P-IN-006 | 用户/业务反馈已检查 | No | 当前无正式入口时允许 N/A | Feedback Source | No |

## 3. Process Checklist

| ID | 检查项 | Required | Validation | Blocker |
|---|---|---:|---|---:|
| P-PR-001 | 问题定义完成 | Yes | 问题、对象、场景清楚 | Yes |
| P-PR-002 | 用户/业务场景完成 | Yes | 主要场景与目标用户明确 | Yes |
| P-PR-003 | 方案空间已分析 | Yes | 至少记录候选方案与判断依据 | Yes |
| P-PR-004 | 优先级完成 | Yes | 有明确优先级逻辑 | Yes |
| P-PR-005 | 业务规则完成 | Yes | 规则可执行、无关键冲突 | Yes |
| P-PR-006 | 非目标/不做项复核 | Yes | 与 Project Scope 一致 | Warning |

## 4. Output Catalog

| ID | Output | Required | Validation | Evidence/Location | Blocker |
|---|---|---:|---|---|---:|
| P-OUT-001 | PRD | Yes | 范围、场景、需求完整 | Git | Yes |
| P-OUT-002 | Business Rules | Yes | 规则可执行且无关键冲突 | Git | Yes |
| P-OUT-003 | User Flow | Yes | 核心路径完整 | Git/Figma | Yes |
| P-OUT-004 | Acceptance Criteria | Yes | 可被 QA 验证 | Git | Yes |
| P-OUT-005 | Product Decision Log | Yes | 关键决策、依据、影响可追溯 | Git | Yes |
| P-OUT-006 | Open Questions | Yes | 未决问题、Owner、下一步明确 | Git | Warning |
| P-OUT-007 | Evidence Registry | Yes | 关键判断来源完整 | Git | Yes |

## 5. Check Result Schema

每个检查项必须产生结构化结果：

- `status`: Pass / Warning / Missing / Fail / Not Applicable
- `required`: Yes / No
- `blocker`: Yes / No
- `evidence`: 来源地址或路径
- `checked_at`: 检查时间
- `checked_by`: 人员 / AI / Agent
- `validation_rule`: 实际采用的检查规则
- `comment`: 结果说明
- `owner`: 缺失项负责人

## 6. Status Rules

- **Pass**：满足检查规则。
- **Warning**：存在风险、待确认或非阻断缺口，但不阻止继续。
- **Missing**：必需项不存在；若 blocker=Yes，则阻断。
- **Fail**：存在内容但未通过规则；若 blocker=Yes，则阻断。
- **Not Applicable**：明确判断不适用，必须记录原因。

## 7. Product Ready Gate

### Pass
所有 Required 且 blocker=Yes 的检查项均为 Pass；允许存在非 blocker Warning。

### Pass with Warning
不存在 blocker Missing/Fail，但存在一个或多个非 blocker Warning。进入 Design 时必须携带 Warning 列表。

### Blocked
存在 blocker Missing 或 blocker Fail，或存在被明确标记为 blocker 的 Warning。

## 8. Downstream Contract

Product Output → Design Input：

- PRD
- Business Rules
- User Flow
- Acceptance Criteria
- Product Decision Log
- Evidence Registry
- Open Questions / Warnings

Design 不应在缺少必需 Product Output 时直接进入正式设计；若确需提前探索，应标记为 Exploration，不得伪装为 Design Ready。

## 9. Execution Metadata

- Stage ID
- Item ID
- Owner
- AI Role
- Start Time
- End Time
- Planned Duration
- Actual Work Duration
- Waiting Duration
- Rework Duration
- Output Location
- Validation Result
- Evolution ID
