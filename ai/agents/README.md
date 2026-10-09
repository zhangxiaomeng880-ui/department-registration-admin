# AI Agents

本目录定义项目级 AI Agent。当前正式区分两大类别：**流程类 Agent（Process Agents）** 与 **能力类 Agent（Capability Agents）**。Testing、Compliance、Audit 仍保持独立职责，不能混为同一职责。

## 1. 流程类 Agent

流程类 Agent 负责项目生命周期中的阶段执行、阶段决策、Gate 与 Handoff。

- Project Agent：创建/刷新 Project Context
- Research Agent：研究与信息获取
- Product Agent：需求、业务目标、规则、验收标准与综合产品决策，并在需求型 Task 中形成权威 PRD Artifact
- Design Agent：UX/UI、视觉、交互与组件规范
- Planning Agent：技术方案、架构与任务拆解
- Engineering / Coding Agent：前后端及工程实现
- QA / Testing Agent：功能、接口、自动化与回归测试
- Compliance Agent：规则、约束和适用要求检查
- Audit Agent：独立检查流程、结论、证据、Artifact / Decision 链路和 Gate
- Release / Deploy Agent：构建、环境、版本与发布
- Maintenance Agent：上线后的维护与迭代

流程类 Agent 可以调用能力类 Agent，但不拥有能力类 Agent 的专业能力。

## 2. 能力类 Agent

能力类 Agent 提供跨阶段复用的专业能力，可以独立运行，也可以被流程类 Agent 或其他授权 Agent 调用。

### Competitor Analysis Agent

竞品情报采集、来源验证、变化识别、竞品对比、趋势、机会/风险和竞品报告。

位置：`ai/agents/competitor-analysis/AGENT.md`

### Data Analysis Agent

数据质量、KPI 计算与分析、异常检测、驱动诊断、优化建议和数据分析报告。

位置：`ai/agents/data-analysis/AGENT.md`

## 3. Common Agent Runtime

所有 Agent 共用：

- Project Context
- Task Manager
- Conversation Manager
- Context Manager
- Capability Router
- Model Router
- Tool Router
- Execution Engine
- State Manager
- Quality Gate
- Execution Record Store
- Output Artifact Store
- Decision Record Store
- Evidence Store
- Token & Cost Ledger
- Model Performance Registry
- Knowledge Manager
- Audit Logger

统一执行层级：

`Project → Phase → Task → Conversation → Step → Tool / MCP / Capability / Model Run → Execution Record → Quality Gate → Output Artifact → Decision Record when applicable → Handoff`

一个 Phase 可以包含多个独立 Task 和 Conversation，并行执行。

## 4. Capability Router

当任务存在可增强结果的能力时，Agent 应向用户提示可用能力。

已有有效结果优先关联；没有有效结果时才建议直接调用能力。用户可以选择关联已有结果、执行新任务、组合多个能力或跳过。

用户配置的 MCP 属于 Common Capability Pool。任何已授权 Agent 均可发现并调用与当前 Task 匹配的 MCP，但不得默认调用全部 MCP；权限、Schema、可用性、成本和执行证据必须满足统一 Contract。

## 5. Execution / Output Boundary

**Execution Record 与 Output Artifact 必须分离。**

- Execution Record：记录 Task 如何执行，包括 Step、Tool / MCP / Model Run、状态、Quality、Token、Cost、Retry、Escalation。
- Output Artifact：面向业务消费的版本化结果。
- Decision Record：记录影响需求、范围、方案、优先级或下游行为的正式决策。
- Evidence：记录重要结论的来源和可追溯链路。

需求型 Task 的主业务输出必须是一个权威、版本化的 PRD Artifact。竞品分析、数据分析、人工输入和产品决策作为 Supporting Sources 关联到 PRD，而不是把多个报告直接当成最终需求。

完整规范：`ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`

## 6. Model Router

Model Router 是全局通用能力，不属于某一个阶段。

目标是：在满足质量门槛的前提下，选择最低成本可行模型。模型执行数据、Token、Cost、Quality、Retry 和 Escalation 必须记录并用于后续模型路由优化。

**注：动态模型路由算法本身暂不在本 Contract / Agent MD 中定稿，作为独立专项设计。**

数据分析遵循 Tool First 原则：确定性计算优先使用 SQL、Python 或 Analytics Tool / 兼容 MCP，LLM 主要用于解释、诊断和推荐。

## 7. Quality Boundary

| 能力 | 核心问题 |
|---|---|
| Testing | 功能是否正确工作？ |
| Compliance | 是否符合规定、规则和约束？ |
| Audit | 前述结论、执行证据、Artifact / Decision 链路和整个流程是否充分、独立、可追溯？ |

Compliance 和 Audit 都可以读取 Testing 结果，但不能因为 Testing PASS 就自动得出 Compliance 或 Audit PASS。

## 8. Unified Agent MD Contract

所有 Agent MD 必须遵循：

`ai/rules/AGENT_MD_CONTRACT_V1.0.md`

Execution 数据必须遵循：

`ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`

任何 Agent MD 不得自行建立与 Contract 冲突的执行套路。

## 9. Audit Agent

Audit Agent 按统一 Contract 对 Agent / Task / Execution / Artifact / Decision 进行独立审计。

位置：`ai/agents/audit/AGENT.md`

Audit 必须检查 Contract 合规、执行证据、Tool / MCP / Model 选择、Token / Cost、Output、PRD / Decision / Evidence 链路、Handoff、Reuse、State 以及独立性。

只有 `AUDIT_PASS` 才作为正式接受结果；关键证据缺失必须为 `AUDIT_BLOCKED`，不得猜测 PASS。

## 10. Shared Execution Rule

所有 Agent 执行前统一检查：

1. Project Context
2. Previous Stage Output（适用时）
3. Knowledge Base
4. Task Input
5. User Input（仅补充缺失 Required Input）

不得重复询问已有且仍有效的项目上下文。

## 11. Shared Output Contract

Agent 应能够提供：

- Input
- Input Verification
- Execution
- Output
- Output Verification
- Gate / Quality Result
- Handoff
- Status

状态：`COMPLETED / PARTIAL / BLOCKED / SKIPPED`。

完整架构见 `ai/agents/AGENT_ARCHITECTURE_V1.6.md`。

设计过程沉淀见 `ai/retrospective/AGENT_MD_CONTRACT_DESIGN_V1.0.md`。
