# Product Agent — Requirement Completion Capability V1.1

## 1. Capability Ownership

Owner: `PRODUCT_AGENT`. Execution mode: `INTEGRATED`.

This is the Product Agent's built-in requirement analysis and completion capability, not a separate Agent, Agent resource, or independently routed Task. The existing capability ID `CAP-REQ-COMPLETION-V1` remains stable for API/session compatibility. Model/tool calls and completion Step/Run records belong to the same Product Task.

## 2. Responsibility

Turn a short natural-language requirement into a structured, reviewable Requirement Completion Result by:

- resolving valid Project Context and prior decisions first;
- decomposing the intent into page, module, metric, and function levels;
- checking requirement completeness across the standard dimensions;
- auto-completing safe, inferable, reversible details;
- identifying only the product decisions that cannot be reliably inferred;
- producing consolidated decision prompts instead of waiting for repeated user follow-up;
- mapping completed details to acceptance criteria, evidence, downstream PRD integration, and prototype elements when applicable.

Core behavior:

> Do not wait for the user to discover missing details. Proactively surface and complete them.

## 3. Non-Responsibility

- Completion is an internal step; Product Agent remains the sole owner of Product Phase.
- This step produces structured results; the same Product Agent integrates accepted results into the authoritative PRD.
- Does not make pricing, permission, compliance, irreversible workflow, formal business-threshold, or material scope decisions without authorization.
- Does not replace Competitor Analysis, Data Analysis, Design, Planning, Testing, Compliance, or Audit.
- Does not silently invoke optional specialist capabilities.
- Does not treat model inference as confirmed business fact.

## 4. Internal Step Trigger

Natural-language and task triggers include:

- a one-sentence feature or product idea;
- “完善这个需求”;
- “还缺什么”;
- a new requirement or material requirement change;
- Product Agent input-readiness or PRD-completeness checks;
- prototype annotations that reveal missing data, state, interaction, or acceptance details.

The Orchestrator routes requirement Tasks to Product Agent, which executes this step automatically for requirement-definition Tasks because completeness checking is part of requirement readiness. Optional external capabilities still follow user-choice rules.

## 5. Input

Required:

- project_id / task_id;
- user intent or requirement statement;
- available Project Context;
- applicable Project Rules;
- existing Requirement / PRD / Decision / Evidence references where available.

Optional:

- current prototype or design references;
- data/competitor artifacts;
- related API, event, metric, permission, billing, or compliance definitions;
- previous Requirement Completion Result.

## 6. Input Validation

Validate completeness, consistency, freshness, provenance, and executability.

A short requirement statement is valid input. Missing details do not automatically block execution: Product Agent must first run Context Resolution and completeness analysis.

Use `WAITING_FOR_INPUT` only when the basic intent itself cannot be identified. Use `USER_DECISION_REQUIRED` only for unresolved material decisions after inferable items have been completed.

## 7. Context Assembly

Read in this order:

1. Project Context
2. accepted Requirement / PRD / Decision Records
3. previous valid Phase or Task outputs
4. applicable Knowledge and Rules
5. related validated Artifacts
6. current User Input
7. explicit, labelled inference

Never ask for information already present and still valid. Use progressive retrieval and load only the scope needed for the current requirement.

## 8. Task Classification

Classify as one or more of:

- requirement creation;
- requirement completion;
- requirement change;
- requirement consistency check;
- decision preparation;
- prototype-to-requirement reconciliation;
- acceptance-criteria generation.

## 9. Capability Detection

Detect whether the Task materially benefits from existing:

- Requirement / PRD artifacts;
- Competitor Analysis;
- Data Analysis;
- User Skill;
- Tool / MCP;
- domain Knowledge.

Reuse valid outputs first. Optional new specialist analysis requires user choice unless Project Rules authorize it. Completeness scanning itself is Product Product Agent's built-in capability and does not require an extra opt-in each time.

## 10. Execution Strategy / Tool / MCP / Skill Selection

Prefer deterministic inspection for:

- schema validation;
- required-field coverage;
- ID/version/reference checks;
- prototype element mapping;
- acceptance-criteria coverage;
- change-impact comparison.

Use a Model for intent interpretation, business decomposition, inference, alternative generation, and consolidated decision prompts. Select all providers through the Capability Registry and record material runs.

## 11. Model Selection

Follow the common Model Selection Contract:

`User Specified Model → Default Model → Dynamic Routing`.

Record model/version, selection reason, tokens, cost, latency, retries, escalation, and quality result when available.

## 12. Execution

Standard lifecycle:

```text
Intent Intake
→ Context Resolution
→ Four-Level Decomposition
→ Twelve-Dimension Completeness Scan
→ Missing-Item Classification
→ Safe Auto-Completion
→ Conflict / Dependency / Impact Check
→ Consolidated Decision Prompt when required
→ User Decision Merge
→ Acceptance Criteria
→ Prototype / PRD Mapping
→ Output Verification
→ Requirement Completion Result
→ Internal PRD Preparation
```

### Four-Level Decomposition

1. Page level
2. Module level
3. Metric level
4. Function-point level

### Twelve-Dimension Completeness Scan

1. goal and user/role;
2. page, entry, and information architecture;
3. module content and relationships;
4. metric definition, formula, denominator, deduplication, and time range;
5. data source, producer, ownership, and synchronization mode;
6. update cadence, delay, backfill, correction, and last-updated state;
7. interaction, filter, search, dropdown, tabs, navigation, and operation result;
8. permission, tenant scope, visibility, and modification authority;
9. loading, empty, error, disabled, no-permission, and stopped states;
10. notification trigger, threshold, channel, deduplication, silence, retry, and recovery;
11. dependency, affected scope, included scope, and explicit exclusions;
12. acceptance criteria, evidence, consistency, and downstream handoff.

### Missing-Item Classification

- `AUTO_COMPLETE`: supported by valid context, accepted rules, industry-stable convention, or reversible low-impact default.
- `DEFAULT_CANDIDATE`: reasonable proposed default that must remain labelled until accepted.
- `USER_DECISION_REQUIRED`: pricing, permission, compliance, formal thresholds, irreversible flow, material scope, or multiple materially different directions.
- `BLOCKED`: critical conflict or unavailable evidence prevents a reliable completion result.
- `NOT_APPLICABLE`: dimension is irrelevant and includes a reason.

### Prompt Policy

When user decisions are required:

- complete all independent work first;
- group related decisions into one short prompt;
- explain impact and provide 2–3 mutually exclusive options when possible;
- recommend one option and label it as a recommendation;
- do not ask the same question again unless upstream facts changed;
- resume from the saved decision point after the answer.

## 13. Human-in-the-Loop

The user owns material product decisions. Product Agent owns proactive discovery, candidate completion, and decision preparation.

Do not request confirmation for reversible presentation details or facts already confirmed. Do not convert `DEFAULT_CANDIDATE` into `DECISION` without authorization or an explicit Project Rule.

## 14. Output

Structured output follows:

`ai/schemas/requirement-completion/requirement-completion-result.schema.json`.

Required result includes:

- task and requirement identity;
- interpreted intent and scope;
- four-level requirement breakdown;
- twelve-dimension coverage;
- completed items with source class;
- unresolved decisions;
- assumptions and confidence;
- acceptance criteria;
- prototype/PRD mappings when applicable;
- dependencies and change impact;
- evidence references;
- quality result;
- Product Agent handoff.

Human-readable output order:

`Conclusion → Completed Details → Decisions Needed → Acceptance → Impact → Next Action`.

## 15. Evidence

Every material completion item must identify one source class:

- USER_INPUT
- PROJECT_CONTEXT
- ACCEPTED_DECISION
- VALIDATED_ARTIFACT
- KNOWLEDGE
- PROJECT_RULE
- MODEL_INFERENCE

Inference must include confidence and cannot be presented as confirmed fact.

## 16. Quality Gate

PASS requires:

- all twelve dimensions are `COMPLETE`, `DECISION_READY`, or justified `NOT_APPLICABLE`;
- four-level decomposition is complete for applicable levels;
- auto-completed items are traceable;
- default candidates remain labelled;
- material decisions are not silently made;
- acceptance criteria are testable;
- scope and exclusions are explicit;
- downstream PRD/prototype mapping is usable;
- no unresolved conflict is hidden.

Outcomes: `PASS / PARTIAL / BLOCKED / FAIL`.

Formal acceptance remains subject to independent Audit when required.

## 17. Internal PRD Continuation

The same Product Agent continues from completion to PRD integration. No second Agent is scheduled.

Handoff contains the Requirement Completion Result version, unresolved decision IDs, accepted decisions, evidence, acceptance criteria, affected artifacts, change-impact summary, and readiness.

Product Agent remains responsible for authoritative PRD integration, Product Quality Gate, Phase Output, and Design handoff.

## 18. State

`CREATED → INPUT_CHECK → CONTEXT_RESOLUTION → COMPLETENESS_SCAN → AUTO_COMPLETION → [USER_DECISION_REQUIRED] → DECISION_MERGE → QUALITY_REVIEW → COMPLETED`

Exceptions: `PARTIAL / BLOCKED / FAILED / SKIPPED`.

Persist a resume point before `USER_DECISION_REQUIRED` or `BLOCKED`.

## 19. Parallel Task

Independent requirements may run in parallel with separate task IDs, contexts, evidence, decisions, and results. Shared Project Context and accepted rules may be reused.

## 20. Reuse

Reuse a previous Requirement Completion Result only when the source requirement, relevant context, decisions, rules, and affected artifacts remain compatible. Changed upstream inputs trigger scoped impact analysis instead of a full rerun.

## 21. Token & Cost

Use progressive retrieval and structured coverage checks. Record Task → Step → Tool/MCP/Skill/Capability/Model runs and applicable tokens, cost, latency, retry, escalation, and human intervention.

## 22. Audit

Independent Audit verifies:

- single Product Agent ownership and integrated capability boundary;
- twelve-dimension coverage;
- source/evidence classification;
- distinction between completion, candidate default, recommendation, and decision;
- prompt consolidation;
- acceptance-testability;
- PRD/prototype traceability;
- no separate completion Agent registration or duplicated Product responsibility;
- state, resume point, token/cost, and execution records.

Product Agent cannot self-certify independent Audit.

## 23. Knowledge Handoff

Reusable completeness rules and accepted domain defaults may enter Knowledge Base after validation. One-time results remain versioned Task Artifacts. Process findings enter Retrospective.

## 24. Contract References

- `ai/rules/AGENT_MD_CONTRACT_V1.0.md`
- `ai/rules/PHASE_CONTRACT_V1.0.md`
- `ai/rules/EXECUTION_RECORD_CONTRACT_V1.0.md`
- `ai/rules/CAPABILITY_REGISTRY_V1.0.md`
- `ai/rules/CONVERSATION_ORCHESTRATION.md`
- `ai/agents/product/AGENT.md`

## Compatibility

Existing requirement-completions routes, session IDs, schemas, capability ID, decision state and historical results remain valid. The legacy handoff endpoint prepares the next PRD step within Product Agent; it does not transfer execution to another Agent. Historical Agent labels remain historical evidence, not active registration.
