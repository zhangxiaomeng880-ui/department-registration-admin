# AI Native Agent Architecture V1.6

## 1. Purpose

This document defines the unified Agent classification and runtime architecture.

Agents are formally divided into:

1. Process Agents
2. Capability Agents

A Phase is owned by a Process Agent. A Phase does not create a second Agent layer; it invokes the owning Process Agent and the capabilities registered in the Common Capability Pool.

## 2. Agent Categories

### 2.1 Process Agents

Process Agents own lifecycle-stage execution, decision-making, Phase Input, Phase Output, gates, and handoff.

Current Process Agents include:

- Project Agent
- Research Agent
- Opportunity Agent
- Product Agent
- Design Agent
- Planning Agent
- Coding / Engineering Agent
- Testing Agent
- Compliance Agent
- Audit Agent
- Release / Deploy Agent
- Maintenance Agent

Project Agent is a project-lifecycle / orchestration agent and is not a Delivery Phase. Audit Agent is an independent assurance agent and is not a Delivery Phase. Compliance Agent is an applicable compliance gate/assurance process and is not interchangeable with Testing or Audit.

A Process Agent may call Capability Agents, Tools, MCPs, User Skills, and Models, but does not copy specialist implementations.

### 2.2 Capability Agents

Capability Agents provide reusable specialist capabilities and can operate independently or be invoked by Process Agents.

Current specialist Capability Agents include:

- Competitor Analysis Agent
- Data Analysis Agent

Capability Agents are not subordinate to Product or another single Phase.

## 3. Common Capability Pool

The Common Capability Pool contains:

- deterministic Tools;
- user-configured MCPs;
- User Skills;
- registered Capability Agents;
- Models.

User-configured MCPs and User Skills are shared capabilities, not private capabilities owned by one Agent.

A User Skill is a reusable user-provided skill / instruction package. It must be applicable and compatible with System Rules, Project Rules, permissions, security boundaries, and the Agent Contract.

No Agent may invoke all available capabilities by default. Selection is Task-specific and must follow the Capability Registry.

## 4. Common Runtime

All Agents / Phases share:

- Project Context
- Phase Manager
- Task Manager
- Conversation Manager
- Context Manager
- Capability Registry / Router
- Tool / MCP / Skill Router
- Model Router
- Execution Engine
- State Manager
- Phase Readiness Gate
- Quality Gate
- Audit Gate
- Phase Handoff Manager
- Execution Record Store
- Output Artifact Store
- Token & Cost Ledger
- Model Performance Registry
- Knowledge Manager
- Audit Logger

These are common runtime capabilities, not additional business Agents.

## 5. Phase Contract

Every project Phase follows the same core contract as its owning Process Agent:

```text
Phase Input
 ↓
Process Agent Input
 ↓
Input Validation / Readiness
 ↓
Task Classification
 ↓
Capability Detection
 ↓
Tool / MCP / Skill / Capability Agent / Model Selection
 ↓
Execution
 ↓
Phase Output
 ↓
Quality Gate
 ↓
Independent Audit Gate
 ↓
Phase Handoff
 ↓
Next Phase Input
```

The Phase MUST have explicit Input, Execution, Output, and Gates. The Phase does not implement a second capability layer.

The approved Phase Output is the formal primary input boundary for the next Phase.

## 6. Execution Hierarchy

```text
Project
  ↓
Phase
  ↓
Task
  ↓
Conversation
  ↓
Step
  ↓
Tool Run / MCP Run / Skill Usage / Capability Task / Model Run
  ↓
Execution Record
  ↓
Quality Gate
  ↓
Output Artifact
  ↓
Decision Record when applicable
  ↓
Phase Output
  ↓
Phase Handoff
  ↓
Next Phase Input
```

A Phase can contain multiple independent Tasks and Conversations that run in parallel.

## 7. Phase Output Chain

```text
Product Output → Design Input
Design Output → Planning Input
Planning Output → Coding Input
Coding Output → Testing Input
Testing Output → Release Input
Release Output → Maintenance Input
```

Supporting Artifacts can be referenced, but the approved Phase Output remains the primary downstream input.

## 8. Design Resource Library Boundary

Design uses the common runtime and does not create a separate execution framework for design resources.

The Design Process Agent may consume and maintain an applicable Design Resource Library through the shared Artifact / Knowledge / Resource mechanisms.

The Design Resource Library has four resource classes:

1. **Common Component Library** — approved reusable components, variants, states, patterns, and usage examples.
2. **Component Specifications** — component anatomy, properties, behavior, interaction, composition, accessibility / responsive rules where applicable, and usage / anti-usage rules.
3. **Design Standards** — visual language, layout / grid, spacing, typography, color, iconography, interaction patterns, responsive / platform rules, and relevant naming / handoff standards.
4. **Project Design Assets** — existing Figma sources, project-specific patterns, brand rules, approved design decisions, and project-specific component extensions.

The Design Agent resolves applicable resources before substantive design execution and prefers approved reusable resources over creating duplicates.

Resource promotion follows:

```text
New / Changed Design Resource
 ↓
Classification
 ↓
Specification + Evidence + Decision
 ↓
Quality Review
 ↓
Project Asset OR Common Resource Candidate
```

A project resource is not automatically promoted to the Common Component Library. Approved reusable resources must retain resource ID, version, owner / source, scope, status, and evidence as applicable.

## 9. Capability Router

Capability Router identifies which registered capability can satisfy or improve a Task.

Candidate types:

- Tool
- User MCP
- User Skill
- Capability Agent
- Model

The router checks capability match, authorization, availability, quality requirements, cost, latency, and applicable user decisions.

## 10. Execution Strategy

Before selecting a Model, determine whether the Task can be reliably completed through a deterministic Tool / MCP / Skill or a registered Capability Agent.

```text
Task
 ↓
Task Classification
 ↓
Capability Detection
 ↓
Capability Registry
 ↓
Tool / MCP / Skill / Capability Agent / Model
```

Strategies may be composed. Deterministic work should use deterministic Tools / MCPs whenever possible.

## 11. Model Router

Model Router is a global common capability.

Objective:

> Select the lowest-cost model that satisfies required quality and capability constraints.

Selection considers:

- Task complexity
- Required capability
- Quality threshold
- Candidate capability
- Historical performance
- Input / output size
- Expected cost
- Latency

Minimum Token is not equivalent to optimal model selection. The optimization target is Quality-Constrained Minimum Cost.

The detailed Dynamic Model Routing algorithm is maintained separately.

## 12. Model Escalation

```text
Lowest-Cost Feasible Model
 ↓
Quality Gate
 ├─ PASS → Complete
 └─ FAIL → Model Escalation → Quality Gate
```

Every escalation records its reason and usage.

## 13. Execution Records and Business Artifacts

Execution Records and Output Artifacts have different responsibilities.

### Execution Record

Records how a Task was executed, including Steps, Tool / MCP / Skill / Capability / Model Runs, state, quality, and usage.

### Output Artifact

Stores the reusable business result intended for downstream consumption.

Examples: PRD, Competitor Report, KPI Report, Design Specification, Technical Plan, Test Report.

For requirement definition, Product MUST produce one authoritative versioned PRD Artifact.

## 14. Decision and Traceability

Material product and design decisions are Decision Records.

```text
Phase Output / Artifact
 ↓
Decision Record
 ↓
Supporting Artifact / Evidence
 ↓
Source Task
 ↓
Step / Tool / MCP / Skill / Capability / Model Run
```

Audit must be able to trace important outputs back to evidence and decisions.

## 15. Phase Handoff and Next-Phase Start

After required Quality and independent Audit gates pass, create a Phase Handoff referencing the approved Phase Output.

The next Phase performs its own Readiness Check. If ready, the system should proactively notify the user with:

- current Phase completion;
- Phase Output;
- next Phase required inputs;
- relevant Tools / MCPs / User Skills / Capability Agents;
- expected execution.

The next business Phase starts after user confirmation unless an explicit Project Rule authorizes automatic progression.

## 16. Task and Conversation Rules

- One Phase does not equal one Conversation.
- Independent Tasks use independent Conversations.
- Parallel Tasks retain independent execution and usage records.
- Tasks exchange results through structured Outputs / Artifacts, Project Context, and Knowledge Base.
- Valid existing capability results should be reused.

## 17. Quality and Cost Feedback Loop

```text
Task
 ↓
Execution Strategy
 ↓
Tool / MCP / Skill / Capability / Model Execution
 ↓
Quality Gate
 ↓
Execution + Token / Cost / Quality Recording
 ↓
Model Performance / Capability Performance Registry
 ↓
Future Optimization
```

## 18. Audit Boundary

Audit Agent remains independent from the Agent being audited.

Audit may inspect:

- Phase Input readiness;
- Process Agent compliance;
- Phase Output completeness;
- Tool / MCP / Skill / Capability / Model selection;
- authorization;
- execution evidence;
- Token / Cost;
- retries / escalations;
- PRD-to-decision-to-evidence linkage;
- Design resource reuse / extension / promotion when applicable;
- Phase-to-Phase handoff integrity;
- unnecessary duplicate execution.

An Agent must not self-certify independent Audit.

## 19. Contract References

- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/PHASE_CONTRACT_V1.1.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.1.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
- `ai/rules/CONVERSATION_ORCHESTRATION.md`
