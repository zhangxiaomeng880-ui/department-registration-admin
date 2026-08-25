# AI Native Knowledge Base — Learnings V1.2

## 1. 本轮复盘结论

本轮流程演进确认：Agent 体系本身不需要继续扩张，主要问题应通过 Conversation Orchestrator、Project Context、Stage Contract 和 Gate 机制解决。

## 2. Project First

项目初始化必须独立成为生命周期入口。Project AGENT 不负责业务需求分析，而负责：

- 建立 Project Context
- 收集最小必要项目资料
- 检查基础设施
- 检查 Git/分支最新状态
- 自动修复安全可自动修复项
- 暴露必须人工完成项

这可以避免后续 Agent 重复询问项目环境信息。

## 3. Human-in-the-Loop

用户体验应从“用户管理 Agent”转向“用户表达目标，Agent 自动判断和执行”。

阶段内部允许自动连续执行；跨阶段默认使用 Human Gate，让用户确认是否进入下一阶段。

## 4. Minimum Token

减少 Token 的正确方式不是删减必要信息，而是：

- 复用上下文
- 摘要优先
- 增量读取
- 差异优先
- 按需读取证据
- 压缩用户输出

质量、准确性、安全性和可追溯性优先于 Token 节省。

## 5. Data Traceability

KPI 和竞品分析不能只保存最终结论。项目级数据能力必须同时保存来源明细、时间、口径和 Evidence，才能支持复盘、审计和历史对比。

## 6. Project-scoped Intelligence

KPI 周报和竞品周报应绑定 Project，而不是成为全局混合数据。这样可以保证目标、数据、竞品和报告上下文一致。

## 7. Gate Independence

Testing、Compliance、Audit 必须保持独立。一个阶段 PASS 不能自动推出另一个阶段 PASS。

## 8. Scheduled Automation

定时任务的可靠性来自“配置 + 来源 + 执行记录 + 输出资产 + 异常记录”，而不是仅设置一个 cron。失败时必须可见，不能静默产生错误结论。

## 9. 下一轮优化方向

- 继续减少重复提问
- 优化 Project Context 的增量更新
- 优化定时任务的失败恢复
- 完善 KPI 数据质量检查
- 完善竞品来源去重和变化检测
- 持续验证各阶段 Human Gate 的实际交互体验
