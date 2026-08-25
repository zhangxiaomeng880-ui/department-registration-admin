# AI Native Project OS V1.2

## 本版本核心升级

V1.2 将 AI Native 项目从“阶段式 Agent 执行”升级为：

**Project Context + Conversation Orchestration + Stage Agents + Independent Quality Gates + Scheduled Project Intelligence**。

## 1. Project 阶段

Project 是所有执行前的项目初始化阶段，不替代业务 Agent。

用户创建新项目时，以自然语言描述项目目标即可。Project AGENT 主动提示最小必要项目信息，并从已有项目资产自动补齐信息。

Project AGENT 必须同时检查基础设施：

- Git 仓库
- 分支及远程最新状态
- 工作树
- 依赖/Lockfile
- Runtime
- 环境配置
- Build/Test/Preview
- 版本
- Design/Figma
- 必要工具与连接

可安全自动修复的问题自动处理；需要用户权限、Secret、登录、生产操作或人工决策的问题明确提示用户。

Project Gate 完成后必须询问用户是否进入 Product。

## 2. Stage Human Gate

每个阶段完成后默认执行一次用户确认：

> 当前阶段已完成，是否进入下一阶段？

阶段内部可自动连续执行；跨阶段默认不静默跳转。

## 3. Conversation Orchestration

用户只表达目标，不管理 Agent。Orchestrator 根据 Project Context、上一阶段输出和当前状态路由 Agent。

只有 Required Input、业务取舍、高风险操作、授权或 Gate 阻塞需要用户介入。

## 4. Token Optimization

所有 Agent 统一遵循：

- Context Reuse
- Progressive Retrieval
- Delta First
- Minimal Prompt
- Compressed Reporting
- Evidence on Demand

Token 优化不能省略关键验证、规则、测试、Compliance、Audit 或用户确认。

## 5. Quality Gates

- Testing：功能正确性
- Compliance：规则/约束符合性
- Audit：流程、结论、证据和 Gate 的独立审计

一个 Gate PASS 不得推导另一个 Gate PASS。

## 6. Weekly KPI Intelligence

每个 Project 可配置 KPI、目标、口径、数据源和上报周期。

系统每周定时依据用户填写/确认的数据执行：

**采集 → 校验 → 来源明细 → 汇总 → 目标对比 → 趋势 → 数据质量检查 → 自动报告**。

每个数据项必须保留来源明细和证据引用；缺失或口径冲突不得猜测。

报告至少包含：Actual、Target、Gap、Achievement、Trend 和 Source Detail。

## 7. Weekly Competitor Intelligence

每个 Project 独立维护竞品清单和关注维度。

每周定时执行：

**采集 → 来源记录 → 去重 → 本周变化 → 与上周对比 → 项目影响分析 → 自动竞品周报**。

每条关键结论必须有来源和时间信息。无法验证的内容必须标记不确定。

## 8. Scheduled Task Governance

所有定时任务必须：

- 绑定 Project
- 绑定配置和周期
- 记录执行时间
- 记录数据来源
- 记录成功/失败
- 记录生成资产
- 记录异常

定时任务失败时必须提示用户，不得生成伪造数据。

## 9. Lifecycle

```text
Project
 ↓
Product
 ↓
Design
 ↓
Planning
 ↓
Coding
 ↓
Testing
 ↓
Compliance
 ↓
Release / Deploy
 ↓
Maintenance / Analytics
 ↓
Audit
 ↓
Iteration → Product
```

Conversation Orchestrator 横跨全部阶段；Iteration 是生命周期循环，不是 Agent。