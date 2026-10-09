# Conversation Orchestration V1.2

> 定位：AI Native 交互编排层
> 原则：Agent 不变，交互方式升级为自然语言人机协作；以最小必要 Token 获取足够上下文并保证准确性、质量和可追溯性。

## 1. 核心原则

用户不需要管理 Agent。用户只需要表达目标、继续、修改或回答问题；Orchestrator 自动识别当前项目状态、阶段、Task、Agent、Gate 和下一步动作。

统一闭环：

**User Intent → Context Resolution → Task / Agent Routing → Product Agent 内部需求补齐（需求型 Task）→ Required Input Check → Capability Detection → Action → Verification / Gate → Output Artifact / Record → Next Action → User**

Conversation Orchestrator 是编排层，不新增业务 Agent，不改变既有 Agent 职责。

## 2. Task 与 Conversation 隔离

一个 Phase 不等于一个 Conversation。

独立 Task 应拥有独立 Conversation，例如 Product：

```text
Product Phase
├─ Human Requirement Task → Conversation A
├─ Weekly Competitor Task → Conversation B
└─ Weekly KPI Task → Conversation C
```

每个 Task 保持独立的上下文、状态、执行证据、Token、Cost 和 Model / Tool / MCP Runs。Task 之间通过 Project Context、Knowledge Base、Structured Output / Artifact 进行结果交换。

## 3. 所有阶段统一采用对话式执行

适用于 Product、Design、Planning、Coding / Engineering、Testing / QA、Compliance、Release / Deploy、Maintenance、Audit 等 Process Agent。

用户可以自然语言表达：

- “继续执行。”
- “把这个调整一下。”
- “按照之前确认的方案继续。”
- “我希望这里改成……”
- “为什么不能继续？”

系统负责把自然语言映射到当前 Agent 的合法动作。

## 4. Agent 主动提示规则

Agent 每次接管 Task 后先判断：

### A. 无需用户决策

直接执行，不询问。

### B. 缺少 Required Input

只询问无法从 Project Context、Previous Output、Knowledge 或已有 Artifact 推导的信息。

### B1. 需求需要主动补全

当用户只提供一句话需求、需求细节不完整或需求变更可能影响已有规则时，Orchestrator 自动路由到 Product Agent，由它执行需求主动补齐内置能力：

1. 读取 Project Context、有效需求/决策/证据；
2. 拆分页面级、模块级、指标级和功能点级需求；
3. 遍历目标、数据源、更新、口径、交互、权限、状态、异常、提醒、依赖、范围和验收；
4. 自动补全可可靠推导且可逆的内容；
5. 把合理但未确认的值标记为默认候选；
6. 只把无法可靠推导的重大取舍合并为一次用户决策提示；
7. 保存 Resume Point，用户回答后从决策点继续；
8. 生成 Requirement Completion Result 并由同一 Product Agent 合入权威 PRD。

不得等待用户逐项追问缺失内容。不得把默认候选静默升级为正式决定。

### C. 存在可选 Capability

如果当前 Task 可明显受益于 Competitor Analysis、Data Analysis 或其他注册 Capability，Agent 应主动提示用户。

对于人工需求，优先检查已有有效 Artifact；没有足够结果时再提示是否调用新 Capability。

标准选项可以是：

- 仅竞品分析
- 仅数据分析
- 两者结合
- 暂不调用

除非项目规则明确要求，否则不得因为能力可用就静默调用。

### D. 存在 Human Gate

用最少问题请求明确决策。

### E. 存在风险操作

在不可逆、影响范围较大或高风险操作前请求确认。

### F. 已有上下文足够

不得为了“确认一下”而重复询问用户。

## 5. 用户回复解析

Agent 应解析自然语言中的：

- 意图
- 决策
- 修改项
- 范围
- 约束
- 优先级
- 是否继续
- 是否拒绝
- Capability 选择

如果回复包含新的项目级事实或决策，应同步更新 Project Context / Decision Log / 对应阶段资产。

如果回复无法可靠解释为一个合法决策，不猜测；只针对歧义点进行最小化追问。

## 6. Capability 与结果复用

Capability Agent 是可独立执行的专业能力。Competitor Analysis 和 Data Analysis 属于 Capability Agent。

User-configured MCP 属于 Common Capability Pool，并可被授权 Agent 按任务需要发现和调用。

调用顺序遵循：

```text
Task
 ↓
Capability Detection
 ↓
Existing Valid Artifact?
 ├─ Yes → Associate / Reuse
 └─ No → User Choice when optional
            ↓
       Independent Capability Task
```

能力执行完成后，结果必须形成可引用的 Output Artifact，而不是只留在 Conversation 中。

## 7. Requirement Task 的 PRD 汇聚规则

当 Task 的目标是形成需求时，Product Agent 负责综合：

- 用户需求输入
- Requirement Completion Result
- Competitor Analysis Artifact
- Data Analysis Artifact
- Project Context
- 已确认 Decision Records
- 其他验证通过的 Evidence

形成一个权威、版本化的 **PRD Artifact**。

关系为：

```text
Evidence
 ↓
Analysis
 ↓
Finding
 ↓
Recommendation
 ↓
Product / Human Decision
 ↓
Requirement
 ↓
PRD Artifact
```

PRD 是业务消费结果，不应包含原始 Model Trace、MCP 调用日志或 Token 明细。上述运行数据保留在 Execution Record / Usage 层，并通过引用保持可追溯。

PRD 中的重要结论 / 决策必须能够反向关联 Decision Record 与支持性 Artifact / Evidence。

## 8. 最小 Token 执行策略

目标不是单纯减少 Token，而是：

> **最小必要上下文 + 最大信息密度 + 关键证据不省略 + 结果可验证。**

### 8.1 Context Reuse

优先读取：

1. 当前任务所需 Project Context
2. 当前阶段 Previous Output
3. 与当前任务直接相关的 Knowledge
4. 已有关联 Artifact
5. 必要的用户输入

禁止每次执行都重新加载整个项目知识库。

### 8.2 Progressive Retrieval

采用渐进式读取：

- Level 0：状态、任务 ID、当前 Agent、Gate、必要上下文摘要
- Level 1：当前阶段所需具体资产 / Artifact
- Level 2：发现冲突 / 缺失时读取关联规则和证据
- Level 3：只有复杂问题才扩展到更大范围的历史、Evolution 或全局资产

默认停在能够可靠完成当前动作的最低 Level。

### 8.3 摘要优先、原文兜底

优先使用已验证的结构化摘要、索引和引用；只有摘要不足以支持准确判断时才读取原文。

关键决策、规则、代码变更、测试证据、合规证据和需求证据不得因为 Token 优化而丢失。

### 8.4 输出压缩

正常对话结果采用：

**状态 → 结论 → 关键发现 → 下一步**

仅在用户要求详细过程或存在审计 / 复核需要时展开完整证据。

### 8.5 不重复解释

同一轮对话中已经确认的信息不得再次完整复述；后续只引用其 ID / 状态 / 结论。

## 9. 质量优先级

Token 优化不得降低以下内容的可靠性：

1. 用户明确决策
2. 业务规则
3. 安全 / 权限 / 数据等高风险约束
4. Gate 判定依据
5. 实际执行证据
6. 测试和合规结论
7. PRD / Decision 的来源链路
8. Audit 所需可追溯信息

发生 Token 预算与准确性冲突时，优先保证准确性和质量。

## 10. Conversation State

每轮交互维护最小状态：

- Project ID
- Issue / Task ID
- Current Stage
- Current Agent
- Current Gate
- Last Confirmed Decision
- Pending Question
- Capability Selection when pending
- Next Action
- Blocker
- Relevant Evidence / Artifact References

不需要在每轮重新构造完整项目状态。

## 11. 标准交互模板

### 自动继续

> 已读取当前项目上下文。当前处于 **{Stage / Agent}**。
> 已具备执行条件，直接继续。
>
> **下一步：** {Action}

### Capability 选择

> 当前需求可以结合 **{Competitor Analysis / Data Analysis}** 进一步完善。
> 你可以选择：**{竞品 / 数据 / 两者结合 / 暂不调用}**。

### 需要确认

> 当前只缺少一个决策：**{Question}**。
>
> 你可以直接回复自然语言，我会根据你的回答继续执行。

### 执行完成

> **{Agent} 已完成。**
> 状态：{Status}
> Gate：{Gate}
> 关键结果：{Result}
> Artifact：{Artifact ID / Version}
>
> **下一步：** {Next Action}

### 阻塞

> 当前无法继续：**{Blocker}**。
> 原因：{Evidence-based Reason}
> 需要：{Minimal Required Action}
>
> 处理后我会自动重新检查并继续。

## 12. Agent 路由规则

用户无需指定 Agent。

Orchestrator 根据：

**当前状态 + 用户意图 + Task 类型 + 上一阶段输出 + Gate + Capability 可用性**

选择负责 Agent / Task。

如果用户明确点名 Agent，则在不违反流程和权限的情况下优先按用户指定执行；如果指定 Agent 与当前状态不一致，应解释并建议正确的下一步，而不是盲目跳阶段。

需求型 Task 的默认路由为：`User Intent → Product Agent（分析 → 补齐 → 决策合并 → PRD → 校验）→ Product Phase Output`。需求主动补齐内置能力 是 Product Agent 的内部能力，不拥有 Product Phase。

## 13. Gate 驱动的对话

Gate 是对话编排的重要状态源：

- PASS → 自动进入下一步
- PARTIAL → 告知未完成项；能自动处理则继续处理
- BLOCKED / FAIL → 暂停并处理阻塞
- Human Gate → 只向用户询问必要决策

Testing、Compliance、Audit Gate 相互独立，不能因为其中一个 PASS 自动跳过其他适用 Gate。

## 14. 记录与可追溯

对话可以是自然语言，但执行数据必须结构化保存：

- User Intent
- Resolved Context
- Agent
- Task
- Action
- Decision
- Evidence
- Tool / MCP / Model Run
- Execution Record
- Output Artifact
- Gate
- Next Action

因此“对话化”不等于“不可审计”。

对于需求 Task，最终业务输出是 PRD Artifact；Execution Record、Usage Metrics、Decision Record 和 supporting Artifacts 保留为可追溯支撑层。

## 15. 错误与不确定性

当 AI 无法可靠判断用户意图、证据或执行结果时：

1. 不猜测关键业务含义。
2. 指出最小歧义点。
3. 只询问解决该歧义所需的信息。
4. 用户回答后继续，不重新开始整个阶段。

## 16. 各阶段统一落地要求

每个 Agent 的 AGENT.md 都必须明确：

- Conversation Entry
- Agent 主动提示条件
- Required Input 的最小询问方式
- Capability Detection / Choice
- 用户自然语言回复解析
- Human Gate
- 自动继续条件
- Blocked / Fail 提示
- Next Action
- Token Optimization Strategy
- Evidence / Artifact / Audit Record

后续新增或修改任何 Agent 时必须同步遵循：

- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`
- 本编排规则

