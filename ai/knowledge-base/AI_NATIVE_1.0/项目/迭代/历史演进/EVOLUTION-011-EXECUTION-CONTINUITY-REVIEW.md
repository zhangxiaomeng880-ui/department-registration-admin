# EVOLUTION-011 — Execution Continuity Review

## 1. 问题 / 背景

本轮文档更新过程中，执行曾多次停留在“确认更新方案”，没有及时进入实际资产更新；同时反复要求已经存在的 ZIP / MD 输入，造成执行循环。

## 2. 输入 / 证据

- Git 中已存在 AI Native Project OS 文档目录与 Knowledge Base
- 已确认 Git 为项目资产底座
- 已确认 Project Context 应跨阶段复用
- 实际执行过程中出现重复索取已有资产的问题

## 3. 根因分析

执行层未严格应用已有 Context Resolution 和资产优先原则：

**已有资产 → 读取 → 验证 → 修改**

被错误地替换成：

**重复确认 → 索取文件 → 再确认 → 无法推进**

## 4. 决策

新增 Execution Continuity Rule：

1. 已确认项目资产不得重复索取。
2. Git / Knowledge / Project Context 优先于用户重新提供。
3. 第一次阻塞必须明确记录原因、缺失项和责任归属。
4. 同一问题不得循环询问。
5. 连续阻塞必须触发 Review / Evolution，并沉淀 Knowledge。

## 5. 执行

已将规则同步到：

- `AI_NATIVE_PROJECT_OS_V1.0.md`
- `AI_RULES.md`
- `STAGE_CONTRACT.md`
- `COMMAND_PROTOCOL.md`
- `AI_NATIVE_LOOP.md`
- Project / Product / Design Agent Prompt
- `PROJECT_DIRECTORY_NOTE.md`
- `README.md`

## 6. 产出

形成统一的执行连续性机制，并与 Project Context Persistence 规则绑定。

## 7. 产出地址

`ai/knowledge-base/v1.0/project-evolution/EVOLUTION-011-EXECUTION-CONTINUITY-REVIEW.md`

## 8. 验证

Git 文档目录、Agent、Rules、Workflow 和 Knowledge Base 均已实际写入更新。

## 9. 结果

以后遇到“已有信息是否需要重新提供”的场景，Agent 必须先读取已有资产；不能因为执行遇阻而要求用户反复提供相同内容。

## 10. 后续影响

Execution Continuity 成为所有 Agent 的通用执行约束，并作为后续 Plugin / Agent 验证的重要自检项。
