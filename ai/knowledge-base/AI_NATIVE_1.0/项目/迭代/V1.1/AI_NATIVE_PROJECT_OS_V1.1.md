# AI Native 项目运行机制 V1.1

> 状态：V1.1 交互与执行机制升级
> 适用范围：当前项目及后续可复用项目
> V1.0：基础 AI Native 流程
> V1.1：在既有 Agent 体系上增加 Conversation Orchestration、最小 Token 执行和人机对话式推进。

## 1. 核心流程

项目生命周期保持：

**持续感知 → 分析 → 决策 → Product → Design → Planning → Coding → Testing → Compliance → Release → Maintenance / Analytics → Audit → Iteration**

其中：

- Agent 是专业执行能力。
- Conversation Orchestrator 是交互/调度层，不是新的业务 Agent。
- Gate 是质量与放行判断机制。
- Iteration 是生命周期循环，不是 Agent。

## 2. Agent 体系

当前 Agent 体系保持稳定，不因本次交互升级新增业务 Agent：

- Product AGENT
- Design AGENT
- Planning AGENT
- Coding / Engineering AGENT
- Testing / QA AGENT
- Compliance AGENT
- Release / Deploy AGENT
- Maintenance AGENT
- Audit AGENT

Analytics 属于分析能力，可被 Workflow / Agent 调用，不作为本次新增 Agent。

## 3. Conversation Orchestration

用户不需要知道当前 Agent，也不需要使用固定命令。

统一交互：

**User Intent → Context Resolution → Agent Routing → Required Input Check → Action → Verification / Gate → Next Action → User**

用户一句自然语言即可触发、继续、修改或确认任务。

### 3.1 Agent 主动提示

- 无需用户决策：直接执行。
- 缺少 Required Input：只询问最小必要信息。
- Human Gate：请求用户做必要决策。
- 风险操作：执行前请求确认。
- 上下文已足够：不得重复询问。

### 3.2 用户自然语言

用户可以说“继续”“按照之前方案”“这里改一下”“先不要发布”等自然语言。

Agent 必须解析意图、决策、修改、范围和约束；产生新的项目级决策时更新 Project Context / Decision Log。

### 3.3 Resume

用户说“继续”时恢复当前 Task、Stage、Agent、Gate、已完成动作、确认决策、Blocker 和 Next Action，不重新索取项目背景。

## 4. Minimum-Token Execution

本项目的 Token 优化目标不是单纯减少 Token，而是：

> **最小必要上下文 + 最大信息密度 + 关键证据不省略 + 结果可验证。**

采用：

1. Project Context 复用
2. Previous Stage Output 复用
3. Knowledge Base 定向读取
4. Progressive Retrieval
5. Summary First / 原文兜底
6. Incremental Context
7. No Redundant Confirmation
8. Compressed Output

默认在能够可靠完成当前动作的最低读取级别停止。

### 4.1 不得为了 Token 优化而省略

- 关键业务规则
- 用户明确决策
- 安全/权限/数据约束
- Gate 判定依据
- 实际执行证据
- Testing / Compliance / Audit 必要证据

准确性与质量优先于 Token 节省。

## 5. 阶段交互统一要求

每个阶段必须定义：

- Conversation Entry
- Required Input
- Auto-Continue Conditions
- Minimal User Prompt
- User Reply Interpretation
- Human Gate
- Blocked / Fail Prompt
- Next Action
- Token Optimization Strategy
- Evidence / Audit Record

具体矩阵见：`ai/agents/AGENT_INTERACTION_MATRIX_V1.1.md`。

## 6. Quality Gates

### Testing

验证功能是否正确工作。

### Compliance

验证是否符合已经确认的规则、约束和适用要求。

### Audit

独立验证流程、结论、证据和 Gate 是否真实、完整、可追溯。

三个 Gate 独立：

**Testing PASS ≠ Compliance PASS ≠ Audit PASS**。

## 7. Evidence / Traceability

对话必须结构化记录：

- User Intent
- Resolved Context
- Agent
- Action
- Decision
- Context Change
- Evidence
- Result
- Gate
- Next Action

因此对话化不会降低审计能力。

## 8. Human Gate

只有核心业务取舍、重大范围变化、高风险操作、例外/豁免、规则冲突和正式发布等明确需要人工决策的节点打断用户。

其余工作自动推进。

## 9. 版本与文档规则

V1.1 相关核心规范：

- `ai/knowledge-base/v1.1/AI_NATIVE_PROJECT_OS_V1.1.md`
- `ai/rules/AI_RULES_V1.1.md`
- `ai/rules/STAGE_CONTRACT_V1.2.md`
- `ai/rules/CONVERSATION_ORCHESTRATION_V1.1.md`
- `ai/agents/AGENT_INTERACTION_MATRIX_V1.1.md`

V1.0 保留作为历史版本和演进依据；当前执行以 V1.1 规则为准。
