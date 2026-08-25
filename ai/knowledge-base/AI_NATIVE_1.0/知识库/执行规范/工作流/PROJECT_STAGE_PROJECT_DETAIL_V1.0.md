# Project Stage — Project Detail V1.0

## 1. Purpose

Project 是整个 AI Native 项目执行链的源头阶段。目标不是开始具体 Product 工作，而是建立足够完整、可被后续阶段消费的项目上下文。

## 2. Input

- 项目背景
- 项目发起原因 / 问题 / 机会
- 业务目标或建设目标
- 已知用户、业务、技术约束
- 已有竞品、数据、KPI、用户反馈（如有）
- 历史 Knowledge Base / 既有项目资产（如有）
- 项目发起人及相关人员信息

## 3. Context Readiness

进入 Process 前至少确认：

- 为什么做：问题或机会清楚
- 做什么：目标边界清楚
- 不做什么：Out of Scope 基本明确
- 已知约束已记录
- 关键已有证据已登记来源
- 历史资产已完成必要检索

如果关键上下文缺失，不进入下一阶段，应标记为 Context Missing 并补齐。

## 4. Process

1. 明确项目问题 / 机会
2. 明确项目目标
3. 明确范围与 Out of Scope
4. 梳理已知约束、依赖和风险
5. 汇总已有证据与历史资产
6. 明确成功标准的初始定义
7. 建立 Project ID 与项目上下文
8. 判断是否 Ready for Product

## 5. Output

必须形成：

- Project Brief
- Project Goal
- Scope
- Out of Scope
- Initial Success Criteria
- Project Context
- Initial Constraints
- Initial Risks / Dependencies
- Evidence / Source Registry
- Project ID

## 6. Output Quality

Output 必须满足：

- Product 能直接理解项目为什么做
- Product 能明确项目边界
- Product 能识别已知约束
- 关键判断具有来源或明确标注为待验证假设
- 每项正式产出均有可定位地址

## 7. Evidence

来源至少可来自：

- competitor
- analytics
- kpi
- user_feedback（待建设）
- knowledge_base
- github
- existing_project_assets

每项重要 Evidence 应记录来源类型、地址/路径、时间或版本、摘要及关联事项。

## 8. Gate — Project Ready

满足以下条件才允许进入 Product：

- Goal 明确
- Scope 明确
- Out of Scope 基本明确
- 关键 Context 完整
- 关键 Evidence 可追溯
- 主要约束与依赖已登记
- Project Output 已落盘并可被 Product 读取

## 9. Downstream

Project Output → Product Input。

Product 不应重新从零寻找 Project 已经明确的目标、范围和约束；如发现冲突，应通过 Decision Log / Evolution 记录并回到相应节点修正。

## 10. Execution Metadata

每次执行记录：

- Owner
- AI Role
- Start Time
- End Time
- Planned Duration
- Actual Work Duration
- Waiting Duration
- Rework Duration
- Output Location
- Validation Result
- Evolution ID

## 11. Reuse

Project 阶段产出的 Project Brief、Context、Constraints、Evidence Registry 和 Success Criteria 应作为可复用项目资产保存，供类似项目检索与初始化。
