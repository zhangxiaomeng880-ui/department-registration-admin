# Phase Contract V1.1

## Purpose

A Phase is a lifecycle orchestration boundary over an existing Process Agent. A Phase MUST NOT create a second execution framework, duplicate Process Agent capability, or define a separate professional workflow.

The Phase invokes the Process Agent assigned to it. Phase Input, Execution, Output, Quality Gate, Audit and Handoff MUST use the same contract semantics already defined for Process Agents in `AGENT_MD_CONTRACT_V1.0.md`.

## 1. Phase and Process Agent

```text
Phase
 ↓ invokes
Process Agent
 ↓ executes using
Unified AGENT MD Contract
```

The Phase manages lifecycle orchestration: readiness, invocation, completion, handoff and next-phase transition. The Process Agent owns the professional work.

The Phase does not create another Agent layer.

## 2. Phase Input

A Phase receives:

- the previous Phase's approved Phase Output as the canonical input for sequential lifecycle execution;
- Project Context;
- current Task input;
- valid decisions and evidence;
- required user input.

The next Phase MUST NOT ask the user to reconstruct information already contained in the approved upstream Phase Output.

## 3. Phase Input / Readiness Gate

The Phase uses the same Input Validation principles and gate semantics as the owning Process Agent:

- completeness;
- validity;
- consistency;
- freshness;
- provenance;
- executability.

Statuses:

- `READY`
- `WAITING_FOR_INPUT`
- `USER_DECISION_REQUIRED`
- `BLOCKED`

A Phase cannot invoke substantive Process Agent execution while required inputs are unresolved.

## 4. Phase Execution

When `READY`, the Phase invokes its existing Process Agent. It does not perform the professional execution itself.

The Process Agent uses the same common runtime:

```text
Task Classification
 ↓
Capability Detection
 ↓
Capability Registry
 ↓
Tool / User MCP / User Skill / Capability Agent / Model
 ↓
Execution
 ↓
Quality Gate
 ↓
Agent Output
```

The Phase records the invocation and consumes the Process Agent's structured output.

## 5. Capability Types

The Common Capability Pool contains:

- `TOOL` — Built-in / System or Project Tool
- `USER_MCP` — User-configured MCP
- `USER_SKILL` — User-provided reusable Skill
- `CAPABILITY_AGENT` — Registered specialist capability Agent
- `MODEL` — Model capability

A Phase does not create any of these. It invokes the Process Agent, and the Process Agent discovers and selects registered capabilities through the Capability Registry.

User Skills are treated as a first-class capability type alongside User MCPs. They must be applicable, discoverable / registered where required, authorized, compatible with System and Project Rules, and traceable when materially used.

## 6. Mandatory Phase Output

Every Phase MUST produce a formal, versioned Phase Output Artifact. Phase completion without Phase Output is invalid.

The Phase Output MUST contain or reference:

- phase_id;
- phase_status;
- completed work;
- decisions;
- findings where applicable;
- evidence references;
- quality status;
- audit status;
- downstream input package;
- unresolved items / constraints;
- source Process Agent and version;
- Artifact version;
- provenance;
- handoff readiness.

Phase Output is a business handoff artifact, not an execution log.

## 7. Phase Output → Next Phase Input

The approved Phase Output is the canonical input boundary of the next Phase:

```text
Product Output → Design Input
Design Output → Planning Input
Planning Output → Coding Input
Coding Output → Testing Input
Testing Output → Release Input
Release Output → Maintenance Input
```

The downstream Phase may add its own Task-specific inputs and valid supporting evidence, but MUST NOT replace the canonical upstream Phase Output.

## 8. Phase Gate = Process Agent Gate

The Phase MUST use the same gate principles and outcome vocabulary as its Process Agent. It MUST NOT create a weaker or separate gate standard.

The common gates are:

1. Input Quality
2. Execution Quality
3. Output Quality
4. Evidence Quality
5. Handoff Quality
6. Independent Audit where required

Outcomes:

- `PASS`
- `PARTIAL`
- `BLOCKED`
- `FAIL`

The Phase may additionally verify that its mandatory Phase Output exists and is consumable by the next Phase; this is a completion check, not a new quality standard.

## 9. Phase Handoff

After Agent Output, required Quality Gate and required Audit:

```text
Agent Output
 ↓
Phase Output
 ↓
Phase Handoff
 ↓
Next Phase Readiness Check
 ↓
User Start Confirmation
 ↓
Next Phase invokes its Process Agent
```

The Handoff references the approved Phase Output rather than duplicating its content.

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
recommended_next_tasks:
expected_capabilities:
next_process_agent:
user_confirmation_required:
```

## 10. Next Phase Prompt

When the next Phase is ready, the system should proactively tell the user:

- current Phase is complete;
- Phase Output is available;
- next Phase is ready;
- required input is satisfied;
- which Process Agent will be invoked;
- expected Tool / MCP / User Skill / Capability Agent / Model types may be used;
- pending decisions, if any;
- explicit action to start or defer.

Example:

> Product 阶段已完成，PRD 已通过与 Product Agent 相同的阶段质量门禁及要求的审计。PRD、业务规则和验收标准已作为 Design 的标准输入准备完成。下一阶段将调用 Design Agent，并通过 Capability Registry 选择可用 Tool / MCP / User Skill / Capability Agent / Model。是否启动 Design 阶段？

The system MUST NOT silently start a new business Phase without required user confirmation unless an explicit Project Rule authorizes automatic progression.

## 11. Parallel Tasks

A Phase may contain multiple independent Tasks / Conversations. Each retains independent Context, State, Execution Record, Token / Cost, Model / Tool / MCP / Skill Runs, and outputs. The Process Agent may aggregate valid results into the Phase Output.

## 12. No Duplicate Phase Execution

A Phase MUST call the existing Process Agent capability. It MUST NOT create a second Phase Agent or duplicate the Process Agent's Input / Execution / Output / Gate logic.

If a Phase requires new professional behavior, update the owning Process Agent or a reusable Capability Agent / shared runtime and audit the change.

## 13. Standard Phase Lifecycle

```text
Phase Input
 ↓
Phase Readiness Gate
 ↓
Invoke Process Agent
 ↓
Agent Input / Execution / Output / Quality Gate
 ↓
Mandatory Phase Output
 ↓
Required Audit
 ↓
Phase Handoff
 ↓
Next Phase Readiness
 ↓
User Confirmation
```

The Phase is complete only when its Process Agent has completed its contract, the mandatory Phase Output exists, and required gates have passed.

## 14. Relationship to Agent Contract

The Phase Contract is an orchestration application of the Agent Contract, not a competing contract.

The Process Agent MD remains the authoritative source for phase-specific professional Input, Execution, Output and quality criteria. The Phase guarantees that these are invoked, preserved and handed forward consistently.
