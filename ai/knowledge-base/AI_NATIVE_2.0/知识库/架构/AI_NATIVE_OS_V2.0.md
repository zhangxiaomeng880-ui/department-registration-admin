# AI Native OS V2.2

## 定位
V2.2 将 Agent 协作、项目事实、质量边界、持续审计、Contract、前置验证输入和用户责任体系固化为可验证、可追溯的项目操作系统。

## Core Architecture
```text
User / Workspace
↓
User & Responsibility Data Layer
↓
Conversation Input Collection
↓
Project Context
↓
Iteration / Stage Router
↓
Agent Contract V2.2
↓
Standard Handoff
↓
Stage Verification
↓
Gate Engine
↓
Independent Audit（Mandatory Trigger）
↓
Evidence
↓
Human Decision / Next Stage
```

## Agent Contract
当前执行 Agent 必须具备：Role / Boundary、Input、Required Input、Context Dependencies、Execution、Auto Actions、User Decision、Verification、Output、Evidence、Gate、Handoff、Failure / Escalation、User Prompt、Token Strategy。

## User & Responsibility Data Layer
用户体系是平台基础数据维护模块，不新增 User Agent。它维护 User、Project Member、Role、Permission、Responsibility、Task Assignment、Human Gate 责任关系和历史 Snapshot。

- Project Creator 默认 Project Owner，可变更。
- Role 与 Responsibility 分离。
- System Preset 与 User Personal Asset 分离。
- 系统权限与项目权限分离。
- Stage Owner 是各阶段 Required Input；Task Assignee、Reviewer、Approver、Decision Owner 按需使用。
- Agent 默认只读 User Context；角色/权限/责任变更必须经过权限检查，必要时进入 Human Gate。
- 历史角色、权限、责任保存 Snapshot，供 Audit 追溯。

详见 `ai/rules/USER_RESPONSIBILITY_DATA_LAYER_V2.2.md` 与 `ai/rules/AGENT_USER_CONTEXT_V2.2.md`。

## Agent User Context
所有阶段 Agent 在 Required Input 中引用当前项目 User Context。Agent 先自动读取已有成员、责任、角色和有效权限；缺失 Stage Owner 时以 Project Owner 为默认候选，仅进行最小对话确认。Agent 不得绕过数据层自行任命人员或修改权限。

## Verification Coverage
不存在笼统的“其他验证阶段”。前置阶段必须通过对话收集下游验证所需输入；各专业 Agent 在自己的职责内完成 Verification：
- Testing：验证实现是否按 Acceptance Criteria 工作
- Compliance：验证是否符合 Applicable Rules / Constraints
- Audit：验证流程、Evidence、Gate、Handoff、责任/权限 Snapshot 和结论是否真实完整可追溯

具体映射以 `ai/rules/VERIFICATION_COVERAGE_MATRIX_V2.2.md` 为准。

## Conversational Required Input
Agent 先从 Context / Handoff / Repository / Environment / User Context 自动补齐，只有缺失字段才提示用户。用户回答后由 Agent 判断是否满足 Required Input；不满足只追问缺失项；需要责任、批准、授权或业务取舍时进入 Human Gate。

后置 Agent 发现缺失输入时必须回溯责任前置 Agent，不得自行创造关键事实。

## Current Agent Set
Project、Product、Design、Planning、Engineering、Testing、Compliance、Release、Maintenance、Analytics、Research/Competitor、Audit。

## Mandatory Audit
以下事件必须自动触发独立 Audit：任意 Agent / Rule / Contract / Verification Coverage 更新、User & Responsibility Data Layer 更新、Knowledge Base 更新、Retrospective 更新、生命周期/阶段规则更新、Gate/Handoff/Environment 规则更新、重大 Project Context 结构变更、阶段完成或 Gate 生成/变更、Release 前、用户主动要求审计。

修复后旧 PASS 自动失效，必须开启新的 Audit Cycle。

## Project Lifecycle
Project 支持 New Project 和 Existing Project Resume。Resume 后通过 Iteration Router 选择最小必要阶段。

## Quality Boundaries
Testing、Compliance、Audit 三者独立；任何一个 Gate PASS 不自动继承到另一个 Gate。

## Environment
Environment Matrix 统一维护 Local / Preview / Test / Production 的 Branch、Version、Commit、Status、Last Verified、Evidence。

## Weekly Intelligence
KPI 与竞品以 Project 为边界持续运行，来源明细、Evidence 和目标对比必须保留。

## Minimum Token
Context Reuse、Summary First、Progressive Retrieval、Delta First、Evidence on Demand、Compressed Reporting。审计范围最小化，不取消审计；Token 优化不得减少关键验证。

## Core Principle
> Agent 是能力，Orchestrator 是协作，Project Context 是事实，User & Responsibility Data Layer 是身份/角色/权限/责任事实，Handoff 是交接，Gate 是质量边界，Evidence 是依据，Audit 是独立持续监督，Human Gate 是责任确认，Verification Coverage 是前置输入与后置验证的映射，Iteration 是持续循环。