# Execution Record Contract V1.1

## 1. Purpose
`AGENT_MD_CONTRACT` defines how an Agent executes. This Contract defines what execution data, business outputs, evidence, decisions, usage metrics, workload and quality data remain traceable after execution.

Core principle:
> **Execution Records serve system traceability; Output Artifacts serve business consumption; aggregated execution/quality data is Project Data Asset.**

## 2. Canonical Relationship
```text
Project → Phase → Task → Conversation → Step
  ├─ Tool Run
  ├─ MCP Run
  ├─ User Skill Usage
  ├─ Capability Task
  └─ Model Run
       ↓
Execution Record → Quality Gate → Output Artifact → Decision → Phase Output/Handoff/Knowledge
```
`task_id` is the primary execution correlation key; phase_id, step_id, run_id, artifact_id and decision_id provide traceability.

## 3. Execution Record
Every material Task MUST produce an Execution Record: task_id, project_id, phase, agent/version, conversation_id, task_type, trigger, start/end, input status, execution strategy, step refs, quality gate, final status, evidence refs.

## 4. Step and Run Records
Every significant Step receives a step_id.

### Tool / MCP Run
Record run_id, task_id, step_id, provider_type, tool/MCP name/version, input/output refs, authorization where applicable, status, latency, retry count, estimated/actual cost, error ref. User MCP must be distinguishable from built-in/project tools.

### User Skill Usage
Record skill id/name/version/source/owner, task/step, purpose, input/output refs, status and quality result.

### Capability Agent Task
Record Capability Agent Task and artifact/execution references. It is reusable, not a Phase-specific implementation.

### Model Run
Record run_id, task_id, step_id, model/version, selection reason, input/output/cached/total tokens, estimated/actual cost, latency, retry, escalation, quality result.

## 5. Business Output Artifact
Completed business Tasks expected to create reusable results MUST produce versioned Output Artifacts: artifact_id, project_id, task_id, agent, type, version, created_at, status, structured content/reference, evidence, quality, intended consumer and validity/supersession.

## 6. Requirement / PRD Output Rule
Requirement-definition Task outputs one unified authoritative PRD Artifact. Competitor Analysis, Data Analysis, User Input, User Skill and Product Decisions are supporting sources. The PRD integrates validated conclusions and source references and must not contain raw execution logs.

## 7. Phase Output
Every Process Agent owning a Phase MUST produce a formal Phase Output. It is the primary input boundary for the next Phase and preserves artifact versions, decisions, constraints, unresolved items, readiness and provenance.

## 8. Decision Record
Material decisions require decision_id, project/phase/task, decision, rationale, sources, deciding party, time and status. Recommendation is not Decision without authorized confirmation or Project Rule.

## 9. Evidence Record
Material claims retain provenance. Evidence classes include User Input, Project Context, Tool, MCP, User Skill, Data, Competitor Source, Agent Output, Knowledge Base and Model Inference. Fact/Finding/Hypothesis/Recommendation/Decision remain distinct.

## 10. Project Data Assets / Metrics
All material execution and quality data is a Project Data Asset.

### Workload
- task_count, step_count, execution_count
- automated_count, manual_count, automation_ratio
- duration
- retry_count
- human_intervention_count
- rework_count
- blocked_count

### Issue / Quality
- issue_count by phase/task/type/severity/priority
- open/resolved/reopened/deferred/blocked
- resolution_rate, reopen_rate, time_to_resolve
- test case coverage, execution coverage, pass/fail/blocked
- regression and retest outcomes

### Consumption
- tool/MCP/skill/capability/model run counts
- input/output/total/cached tokens
- model/tool/MCP/total cost
- latency, retry, escalation

### Aggregation
Metrics aggregate as:
`Project → Phase → Task → Step → Run`
and by Agent, Task Type, Capability Type, Provider, Model, Quality Outcome and Reuse Outcome. Aggregations MUST retain links to source records.

## 11. Reuse / Supersession
Before expensive execution, check valid Artifacts. Record artifact_id when reused. New versions retain supersession relationships.

## 12. Testing-specific Records
Testing must additionally retain structured Test Case, Test Case Audit, Test Execution, Issue, Retest, Regression and Test Report records under `ai/schemas/testing/`. A test failure links to Issue; a fix links to Coding Task/Version; closure links to Retest/Regression evidence.

## 13. Auditability
Audit must navigate `Phase Output/Report/Decision → source Artifact → Evidence → Task → Step → Run`. If a material conclusion cannot be traced to accepted evidence, it is not fully auditable.

## 14. Lifecycle / Immutability
Execution evidence is append-only in principle. Updates create new versions or traceable events. Business Artifacts are versioned; latest accepted version is active.

## 15. Storage Boundary
Execution Records → runtime/audit data; Run Records → tool/MCP/skill/model usage; Metrics → analytics/cost; Evidence → evidence store; Output Artifacts → business store; Phase Output/Handoff → lifecycle store; Decision Records → decision log; reusable conclusions → Knowledge Base; process lessons → Retrospective.
