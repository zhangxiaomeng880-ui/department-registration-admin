# AI Native Project OS V1.3

## 本版本核心升级

V1.3 在 V1.2 的 Project First、Conversation Orchestration、Human Gate、Independent Quality Gates 和 Scheduled Project Intelligence 基础上，补齐**已有项目迭代入口**。

核心模型：

**Project = New Project + Existing Project Resume**

## 1. New Project

用户创建新项目时，以自然语言描述项目目标即可。Project Agent 主动提示最小必要项目资料，并自动检查仓库、分支、依赖、Runtime、环境、Build/Test/Preview、版本和设计资源。

## 2. Existing Project Resume

已有项目不得重复执行完整初始化。用户可直接说“继续这个项目”或提供项目名称/关键词。

Project Agent 首先执行：

**项目快速筛选 → 项目状态恢复 → 最新版本检查 → Git Freshness → 基础设施 Readiness → 上次迭代/Blocker → Resume Gate**。

唯一匹配直接进入；多项目匹配时只展示必要摘要让用户选择。

## 3. Version Awareness

已有项目恢复时必须识别当前版本和最新版本。发现版本差异必须明确提示。

代码同步遵循安全原则：

- 可安全同步 → 自动执行并验证
- 未提交修改/冲突/权限/高风险 → 不覆盖，提示用户

## 4. Iteration Routing

Existing Project Resume 后不默认走完整生命周期。根据本次变更范围选择最小必要阶段。

示例：

- 文案/视觉小改 → Design → Coding → Testing
- 业务功能变更 → Product → Design → Planning → Coding → Testing
- 发布/合规相关 → 追加 Compliance / Release
- 需要独立验证 → Audit

Iteration 是生命周期循环，不是 Agent。

## 5. Human Gate

每个阶段完成后向用户报告结果并询问是否进入下一阶段。Project 新建完成询问是否进入 Product；已有项目恢复完成询问是否开始本次 Iteration。

## 6. Minimum Token

Existing Project 优先读取项目索引、版本状态、Git 差异和最近一次迭代结果；只有异常才深入读取完整历史或文件。不得因 Token 优化跳过关键验证。

## 7. Weekly Intelligence

KPI 和竞品分析继续按 Project 独立配置并每周自动生成。数据来源必须明细化，竞品关键结论必须保留来源和时间。

## 8. Quality Boundary

Testing、Compliance、Audit 保持独立，任一 Gate PASS 不自动推导其他 Gate PASS。
