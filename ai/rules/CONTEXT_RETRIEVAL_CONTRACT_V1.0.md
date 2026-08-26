# Context Retrieval Contract V1.0

## 1. Purpose

本 Contract 将 V2.0 已定义的 `Query → Retrieval → Context Assembly` 落为统一可执行约束。

这里的 RAG（Retrieval-Augmented Generation）是 Context Retrieval 的一种实现方式，不单独成为业务 Agent，也不改变 Project / Phase / Agent / Runtime 的既有边界。

核心目标：

> 在 Agent / Capability 执行前，为当前任务提供与目标、阶段、版本、权限和规则匹配的有效上下文，并保留来源、版本、时间和证据链。

## 2. Scope

覆盖：

- Project Context Retrieval
- Historical Knowledge Retrieval
- Resource / Asset Retrieval
- Rule / Contract Retrieval
- Design / Code / Test / Report Retrieval
- Decision / Failure Case Retrieval
- Context Assembly
- Provenance / Evidence
- Freshness / Version / Permission checks

不规定具体向量数据库、Embedding Provider、Reranker 或检索基础设施；这些属于 Runtime Capability / Implementation。

## 3. Canonical Chain

```text
Trigger
↓
Target Resolution
↓
Project Context Load
↓
Context Retrieval
↓
Context Validation
↓
Context Assembly
↓
Readiness
↓
Routing / Capability Selection
↓
Execution
↓
Verification
↓
Persist
```

当任务明确不依赖外部知识、历史资产或项目上下文时，可以声明 `RETRIEVAL_NOT_REQUIRED`，但仍必须完成 Project Context / Permission / Rule Readiness。

## 4. Retrieval Sources

优先检索以下来源：

1. 当前项目已确认的 Resource / Artifact；
2. 当前版本及当前 Phase 的 Rule / Contract；
3. 当前项目历史 Decision / Issue / Test / Audit / Release 数据；
4. 已授权的跨项目知识库；
5. 经授权的外部知识源。

来源必须携带：

```yaml
source_id:
source_type:
project_id:
resource_id:
version:
status:
effective_at:
updated_at:
permission_scope:
provenance:
```

## 5. Retrieval Modes

Runtime 可以组合以下检索方式：

- Semantic Retrieval：语义相似检索；
- Keyword Retrieval：关键词 / 精确字段检索；
- Metadata Filtering：Project / Version / Stage / Status / Permission 等过滤；
- Relationship Retrieval：按 Resource Relationship 获取上下游资产；
- Structured Query：直接查询结构化 Data Asset；
- Hybrid Retrieval：多种方式组合。

不得要求所有任务强制经过 Vector Search；检索方式由 Runtime 根据任务类型和 Capability 选择。

## 6. Query Construction

检索 Query 至少应考虑：

- User Goal / Task Goal
- Project / Version
- Current Stage / Phase
- Required Resource Types
- Applicable Rule / Contract
- Time / Freshness Requirements
- Permission Scope

不得使用与当前任务无关的历史上下文扩大 Prompt。

## 7. Ranking and Selection

候选 Context 至少按以下因素排序：

1. 适用范围；
2. 规则 / 资产有效状态；
3. Project / Version 一致性；
4. 来源权威性；
5. 与当前任务相关度；
6. 新鲜度；
7. 关系距离；
8. 权限可用性。

`DEPRECATED`、`ARCHIVED`、无权限或与当前版本冲突的内容不得作为有效规则直接注入执行 Context。

## 8. Context Assembly

Context Assembly 必须区分：

- Required Context：执行所必需；
- Supporting Context：辅助判断；
- Historical Context：历史参考；
- Conflict Context：发现冲突时仅用于冲突分析，不得静默覆盖当前有效规则。

最终 Context 必须标记来源，不允许将检索内容伪装为当前事实。

## 9. Freshness / Version / Authority

当多个来源冲突时，优先级由：

```text
Current Effective Contract
→ Current Project Rule
→ Current Project Resource
→ Historical Project Record
→ General Knowledge
```

具体专业领域如已有更高优先级专项 Contract，应遵循该 Contract，而不是在 RAG 层重新定义规则。

## 10. Permission and Security

检索必须继承 Resource / Workspace / Organization / Role / Permission 约束。

不得因“为了提高回答质量”而返回调用方无权访问的文档、代码、数据或凭证。

## 11. Citation / Provenance

任何被 Agent 用于形成关键 Decision、Output 或 Gate 结论的检索 Context，都必须可追溯至 `source_id / resource_id / version`。

执行记录应保存：

```yaml
retrieval_id:
query:
retrieval_mode:
candidate_count:
selected_contexts:
rerank_method:
context_hash:
source_refs:
retrieval_time:
```

## 12. Failure Semantics

- 检索无结果，但业务允许无历史上下文执行：`RETRIEVAL_EMPTY`，继续并记录；
- 关键规则 / 资产缺失：`WAITING_FOR_INPUT` 或 `BLOCKED`；
- 来源冲突无法判定：`USER_DECISION_REQUIRED`；
- 权限不足：`BLOCKED`；
- 来源过期但不存在替代版本：`BLOCKED`，不得静默使用旧规则。

## 13. Agent Boundary

Context Retrieval 由 Runtime / Capability 层统一提供。

Knowledge Agent 负责知识沉淀与更新；不负责替代 Runtime Retrieval。

Process Agent 负责使用已提供的有效 Context 执行任务；不应绕过 Context Contract 读取未授权资源。

Audit Agent 可审计 Retrieval Evidence，但不拥有被审计任务的业务决策权。

## 14. Completion Definition

一次 Context Retrieval 执行只有在以下条件满足后才可标记完成：

1. Target / Project / Stage 已确定；
2. Retrieval 是否必需已判定；
3. 检索来源符合权限；
4. 选中的 Context 具备有效状态与版本；
5. Context Assembly 完成；
6. 关键来源可追溯；
7. Retrieval Result 已持久化；
8. 不存在未声明的 Context 冲突。
