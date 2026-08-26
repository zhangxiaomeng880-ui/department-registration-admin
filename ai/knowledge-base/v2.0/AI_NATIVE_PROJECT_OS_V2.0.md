# AI Native Project OS V2.0

> 状态：V2.0 Foundation / Open Capability PASS
> 定位：V1.0 项目制流程验证 → V2.0 标准化 AI 项目管理与开放能力体系。

## 1. 版本演进

V1.0 用真实项目验证 AI Native 全流程是否可运行；V2.0 从真实项目运行结果中抽象通用能力，使能力脱离单一项目后仍可被查询、调用、执行、组合，并最终封装为标准 API / SDK。

- V1.0 = Project-based Validation
- V2.0 = Standard AI Project OS + Open Capability Foundation

## 2. Foundation Domains

```text
AI Native Project OS V2.0
├── Identity & Access
├── Resource System
├── Capability System
├── Execution System
├── Runtime Capability Pool
├── Model Management
├── Routing & Policy
├── Governance
└── Project Management
```

### Identity & Access

User、Organization、Role、Permission、Workspace、Credential。权限横向作用于 Resource、Capability、Model、Tool、MCP、Skill、Routing 和 Project。

### Resource System

标准 Resource：Project、Requirement、Phase、Milestone、Task、Issue、Asset、Data、Report。

Asset 承载 Design、Code、Test、Knowledge 等项目资产；Data 独立承载 Project、Execution、Model Usage、Routing、Test、Issue、Metric、Audit/Trace、Retrieval / Context 等数据资产。所有 Resource 遵循统一 Resource Contract、Lifecycle、Relationship、Version、Permission。

### Capability System

```text
Query
Retrieval
Context Assembly
Action
```

Retrieval / Context Assembly 是统一 Context Capability；RAG（Retrieval-Augmented Generation）是其可选实现方式，不新增业务 Agent。

Action 标准：Create、Update、Execute、Publish、Terminate、Delete。具体 Resource 是否支持某 Action，由 Resource Contract + Lifecycle + Action Policy + Permission 决定。

### Execution System

Trigger、Minimum Executable Unit (MEU)、Agent、Workflow / Composition。MEU 是最小可执行颗粒度。Trigger 支持 Command、Natural Language、Event、Schedule，并允许未来通过 UI Adapter 接入；无 UI 也必须可以查询和执行。

### Runtime Capability Pool

统一管理 Model、Tool、MCP、Skill、Context Retrieval / RAG Capability。各类能力均可注册、查询、调用、执行、版本化、授权、追踪和审计；用户自定义 MCP / Skill 使用统一 Contract 接入。

### Model Management

Model Pool 是统一资产，模型接入可扩展。维护 Provider、Model、Version、Adapter、Capability、Availability、Permission、Usage、Cost、Trace。

### Routing & Policy

模型执行优先级：

```text
User Specified Model → Default Model → Dynamic Routing
```

用户指定模型优先级最高；用户指定模型失败时明确提示用户，不自动偷偷切换。默认模型失败后可进入动态路由。Routing 根据规则、Score、质量、成本、延迟、能力匹配和容量选择候选模型。低消耗不等于牺牲质量；Routing Budget 是高并发场景的整体最高消耗预算，不是单任务预算。路由规则可配置，决策、调用、Token、成本、延迟、失败、重试必须全链路追踪。

### Governance

Validation、Audit、Gate、Trace、Data Asset。各阶段自动化 Audit 逐步替代原有分散评审，但审计本身必须有 Input、Output、Execution、Evidence、Result。

## 3. 全链路执行

```text
User → Permission → Resource/Task → Trigger → Project Context Load
→ Context Retrieval / RAG（按任务需要）
→ Context Validation / Assembly
→ Agent/Composition → Capability Selection
→ Model/Tool/MCP/Skill → Routing → Execution
→ Validation → Audit → Trace/Data Asset → Output
```

每个阶段、任务、能力必须记录 Input、Output、Execution，以及实际调用的 Agent / Model / Tool / MCP / Skill、Retrieval / Context、Token、Cost、Latency、问题、解决情况和产出地址。阶段输出是下一阶段输入的主要来源。

## 4. Project Management

Project Management 是通用能力之上的标准业务域，不再等同于整个 OS。默认阶段为 Product → Design → Planning → Coding → Testing → Release → Maintenance；阶段是标准 Capability、Agent、Runtime、Gate 的编排。

## 5. Project Create Template

项目创建必须模板化。完整模板至少覆盖：基础信息、业务背景、目标、范围、需求、Design、前后端技术、数据库/基础设施、Repository、Testing、Release、Project Version、Iteration、Milestone、开始时间、结束时间、阶段配置、项目计划、预算、风险、成员/权限、AI 执行配置、已有资产、数据追踪、合规与安全。

所有标准创建字段最终必须有结构化值，但值可来自 User Input、Reference、Template Default、AI Inference 或 System Generated，不要求逐项人工输入。

## 6. Planning & Confidence

开始/结束时间、阶段配置、预算、风险、项目范围、需求规模、资源可用性、历史同类项目等进入 Planning Engine：

```text
Project Template → Planning Engine → Milestone/Phase/Task/Dependency/Schedule
→ Feasibility Analysis → Project Plan Confidence
```

系统必须同时给出计划和可行性/置信度及主要依据；预算、风险、资源、技术复杂度、并发能力可影响周期和置信度。

## 7. Template-first / Reuse-first

项目创建优先一次性结构化模板，减少人机往返和 Token 浪费。

进入 Requirement、Design、Technical Solution、Code、Testing、Audit、Release 等阶段时优先检查已有资源；支持：

- Reference：直接引用
- Clone：复制成独立资源
- Fork：派生版本/分支

引用不等于复制。Reuse-first 的资源发现统一通过 Query / Retrieval，并受 Permission、Version、Status、Relationship 约束。

## 8. AI Asset Tree

完整 UI 未产品化前，AI 可通过轻量属性树展示已有资源：

```text
Project
├── Version / Iteration
│   ├── Requirement
│   ├── Design
│   ├── Technical Solution
│   ├── Code
│   ├── Test
│   ├── Issue
│   └── Report
```

节点可显示 Resource ID、Version、Status、Owner、Created At、Updated At、Relationship。该能力属于 Query + Retrieval + Relationship Presentation，不要求先建设完整后台 UI。

## 9. 数据资产

工作量、自然周期、实际工作耗时、等待耗时、问题数量、解决情况、返工、变更、模型调用、Token、成本、延迟、Tool/MCP 调用、Routing Decision、Retrieval、Context Assembly、Audit、Test Execution、发布结果等均属于项目数据资产，可被 Query、Retrieval、Analytics、Report、Routing 和复盘消费。

## 10. API / SDK

所有开放能力应具备标准 Interface，并最终封装为 API / SDK：

```text
Resource Contract
Capability Contract
Interface Contract
Action Contract
Trigger Contract
Runtime Contract
Routing Contract
Governance Contract
Context Retrieval Contract
        ↓
API → SDK → Agent / Workflow / Project / External System
```

UI 是 Adapter，不是能力成立的前提。API / SDK 不重复实现业务规则，而暴露统一 Contract。

## 11. V1.0 → V2.0 复盘结论

V1.0 的项目实践推动以下标准化：

1. 项目流程与底层 Capability 分层。
2. Resource / Capability / MEU / Interface 成为通用抽象。
3. User / Permission 成为一级基础域。
4. Model、Tool、MCP、Skill 统一为 Runtime Capability。
5. Model Pool、Default Model、User Specified Model、Dynamic Routing 形成完整机制。
6. UI 不再是唯一入口，必须支持 Command / API / SDK 等主动调用。
7. 已有资产优先复用，支持 Reference / Clone / Fork。
8. Project Create 使用完整模板，减少无效对话。
9. 项目计划由配置生成，并提供 Confidence。
10. Audit 作为结构化能力替代分散评审。
11. 阶段 Input / Output / Execution、调用和消耗全部进入数据资产。
12. Context Retrieval / RAG 成为执行时发现和组装有效项目 / 规则 / 知识上下文的标准能力，但不新增业务 Agent。
13. 新增业务通过标准 Contract 扩展，不重新设计底层能力。

## 12. PASS 与落地边界

### Foundation PASS

Foundation Domains、Resource、Capability、Action、Execution、Runtime Capability Pool、User/Permission、Model Pool、Routing、Trigger、MEU、Audit、Trace、Context Retrieval / Context Assembly、Template-first、Reuse-first、AI Asset Tree、Planning/Confidence 原则、API/SDK 标准化方向均 PASS。

### 后续落地

API/OpenAPI/Schema、SDK、Resource/Capability Registry、Runtime Adapter、Model Provider Adapter、Tool/MCP/Skill Registry、Retrieval / RAG Adapter、Reranker、Embedding Provider、Routing Engine、Planning Engine、自动化验证以及可视化 Control Center 属于实现阶段，不反向改变已 PASS 的基础抽象。

## 13. V2.0 执行层基线（已补齐）

V2.0 Foundation 现在通过以下 Contract 收束为可执行 Runtime：

- `ai/rules/V2_EXECUTION_RUNTIME_CONTRACT_V1.0.md`
- `ai/rules/CONTEXT_RETRIEVAL_CONTRACT_V1.0.md`
- `ai/rules/AUDIT_INDEPENDENCE_CONTRACT_V1.0.md`
- `ai/rules/EXECUTION_EVIDENCE_CONTRACT_V1.0.md`
- `ai/rules/RESUME_RECOVERY_CONTRACT_V1.0.md`

统一链路：

```text
Trigger
→ Project Context Load
→ Context Retrieval / RAG（按任务需要）
→ Context Validation / Assembly
→ Stage / Phase Routing
→ Input Readiness
→ Process Agent
→ Capability Selection
→ Execution
→ Output Verification
→ Quality Gate
→ Independent Audit
→ Phase Output
→ Handoff
→ Next-Phase Readiness
→ Human Gate / Authorized Auto Progression
```

阶段完成现在必须同时满足：Required Input Ready、Required Context Ready（或 `RETRIEVAL_NOT_REQUIRED`）、Process Agent Complete、Phase Output Versioned、Quality PASS、Independent Audit PASS、Evidence Trace Complete、Handoff Created、State Persisted、No Blocking Issue。

异常状态统一进入 WAITING_FOR_INPUT / USER_DECISION_REQUIRED / BLOCKED / FAILED / PAUSED 等状态，并必须保存 Resume Point；恢复时不得重新执行已验证的上游结果。

## 14. 文档索引

本版本不复制 V1.x 规则；已有规则与 V2.0 执行层通过 `V2.0_DOCUMENT_INDEX.md` 建立关联。V1.x 保留为演进历史，V2.0 为当前标准能力层的唯一事实来源。
