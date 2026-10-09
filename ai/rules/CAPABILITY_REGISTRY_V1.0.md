# Capability Registry V1.1

## 1. Purpose
The Capability Registry is the common discovery contract for execution capabilities. A Phase or Process Agent does not create a separate capability implementation; it discovers and invokes registered capabilities through the common runtime.

## 2. Capability Types
`TOOL`, `USER_MCP`, `USER_SKILL`, `CAPABILITY_AGENT`, `MODEL`.

## 3. Registry Entry
Every capability should define: capability_id, provider_type, name, supported_tasks, input/output schema, authorization, availability, source/owner, cost, latency/timeout, quality expectation, auditability, version.

## 4. Provider Types
### TOOL
Deterministic built-in/project tooling. Prefer for deterministic work.
### USER_MCP
User-configured MCP is part of the common pool. Must be authorized, compatible, schema-valid, available, auditable, and relevant; availability alone is not a reason to invoke it.
### USER_SKILL
User-provided reusable skill/instruction package. Applicability, source/version and material usage must be recorded; it cannot override System/Project rules or permissions.
### CAPABILITY_AGENT
Registered specialist capability such as Competitor Analysis and Data Analysis. Reusable and independent of lifecycle phases.
### MODEL
For reasoning, interpretation, generation, judgment, or other model-dependent work. Selection is common-runtime governed; dynamic routing is separate.

## 5. Selection Logic
```text
Task → Task Classification → Required Capability → Registry → Candidate Providers
→ Authorization/Availability → Quality/Cost/Latency Constraints → Selection → Execution
```
Do not select a provider before defining the required capability. One Task may compose multiple providers.

## 6. Requirement Completion Capability

| Field | Value |
|---|---|
| capability_id | `CAP-REQ-COMPLETION-V1` |
| provider_type | `CAPABILITY_AGENT` |
| name | Requirement Completion Agent |
| supported_tasks | requirement creation, completion, change, consistency check, decision preparation, acceptance generation |
| input | short natural-language requirement + Project Context + valid Requirement/PRD/Decision/Evidence refs |
| output | versioned Requirement Completion Result |
| schema | `ai/schemas/requirement-completion/requirement-completion-result.schema.json` |
| owner/source | `ai/agents/requirement-completion/AGENT.md` |
| invocation | mandatory before Product Readiness for one-sentence, incomplete, or materially changed human requirements |
| authorization | read Project Context and requirement assets; writes only versioned completion result / records under project policy |
| auditability | Task/Step/Run, source class, inference confidence, decision item, evidence, quality, handoff |
| version | 1.0 |

Selection rule:

- Product Agent and Conversation Orchestrator may invoke this capability automatically for requirement completeness because it is a standard readiness step.
- Optional Competitor/Data/User Skill/MCP capabilities remain subject to the existing selection and authorization rules.
- The Agent must auto-complete inferable items, label default candidates, and consolidate only material unresolved decisions for the user.
- It must not publish the authoritative PRD or duplicate Product Agent ownership.

## 7. Testing Capability Catalog
Testing Process Agent uses this catalog to identify required capabilities before provider selection.

| Testing activity | Required capability | Typical provider types |
|---|---|---|
| Test Case Generation | reasoning / generation | CAPABILITY_AGENT, MODEL, TOOL |
| Test Case Audit | independent audit | CAPABILITY_AGENT, MODEL, TOOL |
| Visual execution | UI/browser automation + evidence | TOOL, USER_MCP, USER_SKILL |
| Functional execution | app/browser automation | TOOL, USER_MCP, USER_SKILL |
| API execution | HTTP/API validation | TOOL, USER_MCP |
| Performance execution | load/performance measurement | TOOL, USER_MCP |
| Boundary execution | parameterized automation | TOOL, USER_MCP, USER_SKILL |
| Tracking validation | runtime/network/analytics validation | TOOL, USER_MCP |
| Compatibility execution | browser/device matrix | TOOL, USER_MCP |
| Runtime compliance validation | authorized inspection | TOOL, USER_MCP, USER_SKILL |
| Issue record/classification | deterministic record + optional analysis | TOOL, USER_MCP, MODEL |
| Issue workflow | issue tracker action | TOOL, USER_MCP |
| Retest / Regression | same applicable execution capabilities | TOOL, USER_MCP, USER_SKILL |
| Test Report | aggregation + narrative synthesis | TOOL, MODEL, CAPABILITY_AGENT |

This table defines capability requirements, not fixed vendors. Actual provider selection is performed per Task/Step.

## 8. User MCP / Skill Rule for Testing
User-configured MCPs and User Skills are eligible when they satisfy the required capability, authorization, schema, environment, and evidence requirements. Testing must not enumerate or invoke every configured MCP/Skill.

## 9. Execution Traceability
Every selected capability is traceable to `Project → Phase → Task → Step → Capability Run`. Record selection reason, provider/version, input/output refs, status, latency, retry, cost, and model tokens where applicable.

## 10. Quality / Failure
Reject candidates that are unauthorized, unavailable, incompatible, insufficient quality, disproportionately costly, or require unavailable approval. Record failure and use defined fallback/escalation.

## 11. Governance
Registry changes require versioning and compatibility review of affected Agents/Phases and Audit criteria.
