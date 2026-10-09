# AI Native 2.0 — Review Responsibility Matrix V1.0

## 1. Purpose

Define which review work can be performed autonomously by AI, which requires AI assistance with human confirmation, and which requires mandatory human review.

This matrix is independent from the Audit function.

## 2. Review Responsibility Levels

- 🟢 AI_REPLACEABLE: AI may complete the review without human review when no other policy requires escalation.
- 🟡 AI_ASSISTED: AI performs the analysis first; human confirmation is required when the configured escalation condition is met.
- 🔴 HUMAN_REVIEW_REQUIRED: human review / decision is mandatory before the Phase may hand off.

Audit is not a review level. Independent Audit is a separate assurance control.

## 3. Phase Matrix

### Research

| Review item | Responsibility |
|---|---|
| Information completeness | 🟢 |
| Source validity | 🟢 |
| Cross-source validation | 🟢 |
| Competitor information organization | 🟢 |
| Evidence linkage | 🟢 |
| Research direction | 🟡 |
| Whether to continue investment | 🔴 |

### Opportunity

| Review item | Responsibility |
|---|---|
| Evidence supporting opportunity | 🟢 |
| Problem existence | 🟢 / 🟡 |
| Opportunity sizing | 🟢 |
| Opportunity prioritization | 🟡 |
| Whether to pursue | 🔴 |
| Strategic priority | 🔴 |

### Product

| Review item | Responsibility |
|---|---|
| PRD completeness | 🟢 |
| Requirement-to-opportunity consistency | 🟢 |
| User flow completeness | 🟢 |
| Exception coverage | 🟢 |
| Data field completeness | 🟢 |
| Requirement conflicts | 🟢 |
| Metric definition | 🟡 |
| Product solution evaluation | 🟡 |
| Product trade-offs | 🔴 |
| Business-goal acceptance | 🔴 |
| Final requirement confirmation | 🔴 |

### Design

| Review item | Responsibility |
|---|---|
| PRD-to-screen coverage | 🟢 |
| Screen completeness | 🟢 |
| User-flow coverage | 🟢 |
| State coverage | 🟢 |
| Component usage | 🟢 |
| Design Token compliance | 🟢 |
| Spacing / typography / color rules | 🟢 |
| Responsive checks | 🟢 |
| Figma structure completeness | 🟢 |
| Design System consistency | 🟢 |
| Developability | 🟢 |
| Visual hierarchy | 🟡 |
| UX quality | 🟡 |
| Information architecture quality | 🟡 |
| Visual direction / aesthetics | 🔴 |
| Brand consistency | 🔴 |
| Major design trade-offs | 🔴 |
| Final Design approval | 🔴 |

### Planning

| Review item | Responsibility |
|---|---|
| Requirement coverage | 🟢 |
| Design coverage | 🟢 |
| Technical task completeness | 🟢 |
| Dependency analysis | 🟢 |
| Task granularity | 🟢 |
| Development sequence | 🟢 |
| Technical risk analysis | 🟡 |
| Schedule estimation | 🟡 |
| Technical trade-offs | 🔴 |
| Resource commitment | 🔴 |

### Coding / Engineering

| Review item | Responsibility |
|---|---|
| Coding conventions | 🟢 |
| Lint / type checks | 🟢 |
| Unit-test coverage | 🟢 |
| API contract | 🟢 |
| Design-to-code consistency | 🟢 |
| Security rule scans | 🟢 |
| Code quality analysis | 🟢 |
| Performance analysis | 🟡 |
| Architecture quality | 🟡 |
| Core architecture trade-offs | 🔴 |
| High-risk technical changes | 🔴 |

### Testing

| Review item | Responsibility |
|---|---|
| Test-case completeness | 🟢 |
| Functional testing | 🟢 |
| Regression testing | 🟢 |
| API testing | 🟢 |
| UI testing | 🟢 |
| Edge-case testing | 🟢 |
| Error handling | 🟢 |
| Data consistency | 🟢 |
| Test-result analysis | 🟢 |
| Business-goal acceptance | 🟡 |
| High-risk production acceptance | 🔴 |

### Compliance

| Review item | Responsibility |
|---|---|
| Defined-rule checks | 🟢 |
| Required-field checks | 🟢 |
| Permission checks | 🟢 |
| Data-processing rules | 🟢 |
| Policy checks | 🟢 |
| Compliance evidence completeness | 🟢 |
| Complex legal interpretation | 🟡 |
| Legal liability judgment | 🔴 |
| High-risk compliance release | 🔴 |

### Release / Deploy

| Review item | Responsibility |
|---|---|
| CI/CD status | 🟢 |
| Build success | 🟢 |
| Test status | 🟢 |
| Compliance status | 🟢 |
| Audit status | 🟢 |
| Deployment health | 🟢 |
| Rollback condition | 🟢 |
| Release risk analysis | 🟡 |
| Major-version release | 🔴 |
| High-risk production change | 🔴 |

### Maintenance / Iteration

| Review item | Responsibility |
|---|---|
| Bug classification | 🟢 |
| Log analysis | 🟢 |
| Anomaly detection | 🟢 |
| Metric-change analysis | 🟢 |
| Regression-impact analysis | 🟢 |
| Root-cause analysis | 🟡 |
| Product-adjustment recommendation | 🟡 |
| Core business-direction change | 🔴 |
| Major iteration approval | 🔴 |

## 4. Human Review Gate

Any 🔴 item MUST create a structured Human Review Task. The task must identify:

- phase_id;
- review_item;
- reason human judgment is required;
- AI analysis and evidence;
- decision options;
- decision owner;
- decision status;
- decision timestamp;
- decision evidence.

A required Human Review Task that is not resolved MUST prevent Phase Handoff.

## 5. AI-Assisted Escalation

For 🟡 items, AI performs the initial assessment. Escalation to human review is required when configured thresholds, uncertainty, risk, disagreement, or policy conditions are met.

## 6. Relationship to Audit

Review evaluates professional / product / design / technical judgment.

Independent Audit evaluates process integrity, contract compliance, evidence sufficiency, gate integrity, and traceability.

Audit MUST NOT be used as a substitute for a 🔴 Human Review item.

## 7. Handoff Rule

Phase Handoff requires:

1. all 🟢 review work completed;
2. all applicable 🟡 items resolved or escalated according to policy;
3. all 🔴 Human Review Tasks resolved with required approval;
4. required Quality Gate passed;
5. required Compliance Gate passed when applicable;
6. Independent Audit Gate passed;
7. required user confirmation completed.
