# V2 Execution Runtime Contract V1.0

## 1. Purpose

把 V2.0 方法论落为可机器执行的 Runtime Contract。该 Contract 不重新定义 Product / Design / Engineering / QA 等专业规则，而统一规定：Trigger、Context、Readiness、State、Execution、Quality、Audit、Handoff、Resume、Recovery、Persistence。

## 2. Canonical Execution Chain

```text
Trigger
↓
Project Context Load
↓
Context Retrieval / RAG（按任务需要）
↓
Context Validation / Assembly
↓
Stage / Phase Routing
↓
Input Readiness
↓
Process Agent Invocation
↓
Task Classification
↓
Capability Detection
↓
Tool / MCP / Skill / Capability / Model Selection
↓
Execution
↓
Output Verification
↓
Quality Gate
↓
Independent Audit Gate
↓
Phase Output
↓
Handoff
↓
Next-Phase Readiness
↓
Human Gate / Authorized Auto Progression
```

任何自动化能力必须进入该链路，不得绕过 Gate、Audit、Context Contract 或 Evidence 持久化。

## 3. Runtime Components

必须由统一 Runtime 管理：

- Project Context
- Context Retrieval / RAG Capability
- Context Assembly / Validation
- Project / Stage / Phase State
- Trigger Router
- Process Agent Router
- Capability Registry / Router
- Tool / MCP / Skill Router
- Model Router
- Execution Engine
- Quality Gate
- Independent Audit Gate
- Handoff Manager
- Resume / Recovery Manager
- Execution Record Store
- Output Artifact Store
- Evidence / Trace Store
- Token / Cost Ledger
- Knowledge / Evolution Writer

这些属于 Runtime，不新增业务 Agent。

## 4. Context and Readiness

执行前必须检查：

- Project / Version / Stage / Phase 是否正确；
- 必需 Input 是否存在；
- 是否需要 Context Retrieval；
- Required Context 是否已检索、验证和组装；
- Input / Context 是否通过完整性、有效性、一致性、新鲜度、来源、可执行性检查；
- 依赖的 Rule / Contract / Capability 是否存在且为有效版本；
- 必需权限、Repository、Branch、Preview、工具和资源是否可用；
- 是否存在未解决的阻塞项。

关键规则或资产缺失：`WAITING_FOR_INPUT` 或 `BLOCKED`。
需要用户做业务选择或存在无法自动消解的来源冲突：`USER_DECISION_REQUIRED`。
系统依赖未满足：`BLOCKED`。
不得通过猜测补齐关键事实。

当任务不依赖外部知识、历史资产或项目上下文时，可以记录 `RETRIEVAL_NOT_REQUIRED`，但仍必须完成 Project Context、Permission、Rule 和 Input Readiness。

## 5. State Machine

### Project

`CREATED → READY → IN_PROGRESS → BLOCKED / PAUSED → COMPLETED → CLOSED`

### Phase / Stage

`CREATED → INPUT_CHECK → READY → EXECUTING → QUALITY_REVIEW → AUDIT → HANDOFF_READY → COMPLETED`

### Task / Step

`CREATED → INPUT_CHECK → EXECUTING → QUALITY_REVIEW → COMPLETED`

### Exception States

`WAITING_FOR_INPUT / USER_DECISION_REQUIRED / USER_CONFIRMATION_REQUIRED / USER_APPROVAL_REQUIRED / BLOCKED / FAILED / SKIPPED / PARTIAL`

每次状态转换必须记录：`state_transition_id / from_state / to_state / trigger / actor / timestamp / reason / evidence_refs`。

## 6. Trigger Rules

支持：

- Command
- Natural Language
- Event
- Schedule

Trigger 统一执行：

`Resolve Target → Load Context → Retrieve / Assemble Context → Readiness → Route → Execute → Verify → Persist → Notify`。

阶段完成后自动产生 `NEXT_PHASE_READY` 事件，但新的业务阶段默认必须经过 Human Gate；只有 Project Rule 明确允许时才可自动推进。

## 7. Output and Handoff

Process Agent 必须产生版本化 Phase Output。Handoff 必须引用该 Phase Output，而不是重新拼装事实。

Handoff 至少包含：

```yaml
handoff_id:
project_id:
from_phase:
to_phase:
source_agent:
source_agent_version:
source_phase_output:
required_inputs:
optional_inputs:
readiness:
missing_inputs:
required_decisions:
expected_capabilities:
next_process_agent:
user_confirmation_required:
```

## 8. Independent Audit Gate

Quality Gate 与 Independent Audit Gate 分离。

- Process Agent 不得审计自己；
- Testing / QA 不等于 Audit；
- Compliance 不等于 Audit；
- Audit 不实施被审计任务；
- Audit 不修改被审计结论；
- Audit 不得自证自己的 `AUDIT_PASS`。

关键阶段必须满足：`Quality PASS + Audit PASS + Phase Output Valid + Handoff Valid` 才能正式完成。

## 9. Resume / Recovery

任何暂停、阻塞、失败状态必须形成 Resume Point：

- Project / Stage / Phase / Task / Step
- current state
- completed steps
- unresolved steps
- missing input
- blocker
- last valid Artifact / Commit / Version
- last valid Context / Retrieval Result
- next legal action
- retry count
- last error / evidence

恢复时：

1. 优先复用已确认上下文；
2. 从 Resume Point 继续，不从头执行；
3. 仅重试失败步骤或受影响下游；
4. 若上下文、Contract、规则或输入发生变化，重新执行 Readiness；
5. 同一阻塞重复出现时触发 Review / Evolution，禁止循环提问。

## 10. Persistence

每次有效执行必须至少持久化：

`Input → Retrieval Decision → Context → Decision → Execution → Output → Verification → State → Evidence → Handoff`

执行日志、Retrieval Evidence 与业务 Artifact 分离，但三者必须通过关联 ID 可追溯。

## 11. Auto Progression Policy

默认：

`阶段完成 → 生成下一阶段 Ready 状态 → 提示用户 → 用户确认 → 启动下一阶段`

允许自动推进的条件必须来自显式 Project Rule，并记录 Rule ID、适用范围、授权时间和审计证据。

## 12. Failure Semantics

- `PARTIAL`：核心执行可用，但有非阻塞缺口；必须列明。
- `BLOCKED`：关键依赖、关键 Context 或证据缺失，不能继续。
- `FAILED`：执行未达到目标，需要修复 / 重试。
- `AUDIT_FAIL`：独立审计发现阻塞问题，不得标记阶段完成。
- `RETRIEVAL_EMPTY`：未检索到候选 Context；只有在任务允许无历史 / 外部 Context 时才能继续。

任何失败都不得被自动降级为 PASS。

## 13. Change Impact

发生 Product / Design / Engineering / Data / QA / A-B / Release / Rule / Context 变化时，Runtime 必须识别受影响的上下游资产、Phase Output、Handoff、Tests、Knowledge、Retrieval Context 和 Audit，并生成 Change Impact Record。

## 14. Completion Definition

只有满足以下条件，Runtime 才能写入 `PHASE_COMPLETED`：

1. Required Input 已验证；
2. 必需 Context 已验证，或明确记录 `RETRIEVAL_NOT_REQUIRED`；
3. Process Agent 已执行；
4. Phase Output 已生成并版本化；
5. Quality Gate 通过；
6. Required Audit 通过；
7. Evidence 可追溯；
8. Handoff 已生成；
9. State 已持久化；
10. 无未声明的 blocking issue。
