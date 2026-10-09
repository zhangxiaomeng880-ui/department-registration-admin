# AI Native Loop V2.0

```text
用户问题 / 产品目标
        ↓
Research
        ↓
Opportunity
        ↓
Product / PRD
        ↓
Design
        ↓
Planning / Task
        ↓
Coding / Engineering
        ↓
Testing
        ↓
Review / Human Gate（仅适用项）
        ↓
Compliance（适用时）
        ↓
Independent Audit
        ↓
Release / Deploy
        ↓
Maintenance / Analytics
        ↓
Feedback / Insight
        └────────→ 下一轮 Research
```

## 阶段原则

每一阶段都有明确 Input / Readiness / Execution / Output / Quality Gate / Review responsibility / Compliance applicability / Independent Audit / Handoff / Status。

Testing、Review、Compliance、Independent Audit 是不同控制职责，不得合并为 `QA / Review`。

## Review Responsibility

评审按 `ai/rules/REVIEW_RESPONSIBILITY_MATRIX_V1.0.md` 分类：

- 🟢 AI_REPLACEABLE — AI 可独立完成；
- 🟡 AI_ASSISTED — AI 先分析，满足升级条件时进入人工确认；
- 🔴 HUMAN_REVIEW_REQUIRED — 必须创建 Human Review Task，未解决不得 Handoff。

Independent Audit 不属于 Review，必须由独立 Audit Agent 执行。

## Context 继承

阶段切换不是上下文重置。每阶段执行前恢复：Project Context → Previous Phase Output → Knowledge Base → User Input（仅补充缺失 Required Input）。已确认且仍有效的信息必须复用。

## Handoff

Phase Handoff 只有在适用 Quality Gate、Compliance Gate、Human Review Gate、Independent Audit Gate 均满足，并完成必要用户确认后才能进入下一 Phase。Audit FAIL / BLOCKED 或未完成 Human Review 必须阻断 Handoff。

## Execution Continuity

同一问题首次无法解决时必须明确 Blocked 原因；连续阻塞不得重复询问相同信息，应触发 Review / Evolution，并将修正规则沉淀到 Knowledge。
