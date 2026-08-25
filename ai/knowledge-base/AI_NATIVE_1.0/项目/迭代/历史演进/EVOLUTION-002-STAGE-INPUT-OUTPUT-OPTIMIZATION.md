# EVOLUTION-002｜阶段 Input / Output 标准化优化

> 状态：V1.0 第一轮骨架已确认  
> 目的：记录本轮从“完整项目流程”进一步优化为“每个阶段可执行的 Input / Output 标准”的演进过程。  
> 说明：记录可审计的项目问题、判断、决策、执行、产出与验证，不记录模型隐藏的 Chain-of-Thought。

## 1. 背景 / 问题

已有 AI Native 项目流程已经覆盖 Project → Product → Design → Engineering → QA → Release → Data / Analytics → Knowledge，也已经建立了项目层级、执行记录、Source / Evidence、Context Readiness、Human Gate、自动验证和知识自闭环。

但仅有阶段名称和整体链路仍不足以直接驱动 AI 执行。阶段之间最关键的接口没有被充分标准化：

- 这个阶段开始前必须拿到什么？
- 什么情况下上下文算完整？
- 阶段执行后必须交付什么？
- 哪些产出是下一阶段的必需输入？
- 什么条件满足后才能进入下一阶段？

因此，本轮优化不新增业务阶段，而是细化现有阶段的 Input / Output。

## 2. 关键判断

如果只定义“流程节点”，流程仍然主要供人理解；如果定义每个节点的 Input / Process / Output / Evidence / Gate，流程才开始具备机器可执行、自动检查和跨项目复用的基础。

因此确定统一 Stage Schema：

**Input → Context Readiness → Process → Output → Evidence → Gate → Next Stage**

并继续关联：Owner、AI Role、时间/耗时、产出地址、Validation、Downstream。

## 3. 本轮决策

### 决策 1：保留现有阶段链路

不新增新的业务阶段，继续使用：

**Project → Product → Design → Engineering → QA → Release → Data / Analytics → Knowledge**

### 决策 2：统一阶段接口

所有阶段使用相同的 Stage Schema，避免不同阶段采用不同记录方式。

### 决策 3：Output 必须可消费

阶段 Output 不是“完成描述”，而必须是下一阶段能够直接消费的结果或资产。

例如：

- Product Output → Design Input
- Design Output → Engineering Input
- Engineering Output → QA Input
- QA Output → Release Input
- Release Output → Analytics Input
- Analytics Output → Knowledge / Product Input

### 决策 4：Gate 必须与 Output 关联

不能只说“阶段完成”，必须判断 Output 是否满足进入下一阶段的条件。

## 4. 执行产出

### 核心产出

`ai/knowledge-base/v1.0/workflows/PROJECT_STAGE_INPUT_OUTPUT_MATRIX_V1.0.md`

内容包含：

- 统一 Stage Schema
- Project / Product / Design / Engineering / QA / Release / Analytics / Knowledge 的第一版 Input / Output
- 每阶段 Gate
- Downstream 关系
- 后续细化项

### 产出类型

Workflow / Knowledge / Project Process Asset

## 5. 产出血缘

```text
已有完整 AI Native 流程
        ↓
发现阶段接口不够明确
        ↓
确定 Input / Output 是下一步核心优化
        ↓
统一 Stage Schema
        ↓
建立 Stage Input / Output Matrix
        ↓
后续逐阶段细化
        ↓
形成可检查的 Workflow / Agent Schema
```

## 6. 当前验证

本轮首先验证结构完整性，而不是验证具体业务字段已经最终定稿。

当前确认：

- 阶段链路可以保持不变
- Input / Output 可以成为阶段之间的标准接口
- Gate 可以作为阶段完成与流转条件
- Output Location 可以连接 Git / Figma 等真实资产
- 后续可以进一步机器化为 Workflow / Agent 的输入输出 Schema

## 7. 当前结果

V1.0 已形成第一版《Project Stage Input / Output Matrix》。

当前状态不是“所有字段已经最终确定”，而是完成了标准骨架。下一步应逐阶段细化必填字段、可选字段、验收条件、Evidence、自动检查和失败路径。

## 8. 后续影响

该优化将直接支撑：

- Context Readiness 自动检查
- Stage Gate 自动检查
- Agent 输入上下文构建
- Output Schema 校验
- 阶段自动流转
- 失败/退回/重试
- 项目模板复用
- 跨项目 Workflow 复用

## 9. 下一步

按 Project → Product → Design → Engineering → QA → Release → Analytics → Knowledge 顺序逐阶段深度细化，优先明确：

1. 必需 Input
2. 可选 Input
3. 必须 Output
4. Output 验收标准
5. Evidence 来源
6. Gate 条件
7. AI 自动化边界
8. 退回 / 重试路径
9. 资产定位方式
