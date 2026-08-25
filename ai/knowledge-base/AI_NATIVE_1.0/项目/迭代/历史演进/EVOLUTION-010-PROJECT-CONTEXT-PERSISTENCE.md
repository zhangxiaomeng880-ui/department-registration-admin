# EVOLUTION-010 — Project Context Persistence

## 1. 问题 / 背景

项目基础信息在多阶段执行中被当成 Stage 临时 Input，导致阶段切换、Continue 和 Resume 时出现重复询问。

典型信息包括：Project Name、Version、Repository、Branch、Runtime、Workspace，以及已确认的项目范围和约束。

## 2. 输入 / 证据

- 已有 Project Initialization Agent
- 已有 V1.0 Knowledge Base
- 已有 Product / Design Agent 文档
- 多轮阶段执行中发现基础信息重复采集
- Git 已作为项目资产底座

## 3. 分析 / 判断

根因不是缺少信息，而是缺少明确的生命周期级 Project Context 层，以及统一的输入解析优先级。

## 4. 决策

建立 Project Context Persistence Rule：

**Project Context → Previous Stage Output → Knowledge Base → User Input**

Project Initialization 创建/刷新 Project Context；后续 Stage Agent 继承并复用。

## 5. 执行

已更新：

- `ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`
- `ai/knowledge-base/v1.0/PROJECT_DIRECTORY_NOTE.md`
- `ai/rules/AI_RULES.md`
- `ai/rules/STAGE_CONTRACT.md`
- `ai/rules/COMMAND_PROTOCOL.md`
- Project / Product / Design Agent Prompt
- `ai/workflows/AI_NATIVE_LOOP.md`
- 根目录 `README.md`

## 6. 产出

- Project Context 生命周期规则
- Stage Contract
- Command Protocol
- Agent Context Resolution 规则
- Knowledge Base 更新

## 7. 产出地址

Git repository: `zhangxiaomeng880-ui/city-service-admin`

主要路径：`ai/knowledge-base/v1.0/`、`ai/rules/`、`ai/agents/`、`ai/workflows/`

## 8. 验证

通过 Git 文件读取确认原始文档结构后进行更新；所有修改均通过 Git Contents API 写入 `main`。

## 9. 结果

Project Context 从“阶段输入”提升为“项目生命周期资产”，后续 Agent 不再因 Stage 切换而重新采集已确认项目基础信息。

## 10. 后续影响

所有新增 Agent Contract、Command Protocol 和 Workflow 必须继承该规则。新增项目级信息必须在执行后持久化。
