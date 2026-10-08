# M32.1｜平台实现映射与缺口分级｜CURRENT

日期：2026-10-08
状态：SOURCE_BASELINE_VERIFIED / M32.1 REQUIREMENT_DEFINITION_NOT_FOUND / IMPLEMENTATION_GATE_HOLD

## 事实源与范围

- 当前私有前端仓库 `zhangxiaomeng880-ui/department-registration-admin`，候选基线 `feat/ai-native-console-real-binding-m31`；现审查分支 `feat/ai-native-m32-5-final-release-gate`。M32.1–M32.4.4 独立实现分支未见于 GitHub 分支列表，但不能证明未命名分支/历史提交中没有相关实现。
- 架构基线 `AI_NATIVE_2.0_MASTER_BLUEPRINT_V1.4_FROZEN.md` 明确：GitHub/Runtime/数据库是已实现事实源，冻结蓝图主要覆盖 M25–M30，不应自动视为 M32.1 的需求单。
- 已检索用户资料库中“M32.1 M32.2 M32.3 M32.4.4 / Workbench / Requirement”相关资料，未发现可唯一归属 M32.1 的正式验收规格。因此不得自行把下一里程碑“定案”为某些 UI 能力。
- 已有的 M31 信息架构文档 `apps/ai-native-console/M31_INFORMATION_ARCHITECTURE_V0.5_CURRENT.md` 描述并验证了下列现存路由/只读数据语义。它的 CI 测试可能使用 isolated fixture，不能等价于真实授权用户 Staging E2E。

## 可复用代码映射（实现线索，不是 M32.1 PASS）

| 领域 | 已有源码/入口 | 状态 | 下一验证 |
| --- | --- | --- | --- |
| 全局导航 | `public/app.js` 的 `parseRoute`, `navigate`, `setActiveNav` | M31 BASELINE_REUSE | Staging 已登录用户端到端 URL/前进后退 |
| 项目工作区 | `/projects/:id/overview` + `tasks/assets/data/stages/audit` | M31 BASELINE_REUSE | 实际项目权限与刷新结果 |
| 任务详情 | `/projects/:id/tasks/:taskId` | M31 BASELINE_REUSE | 与 `governance.workItems` 真实 ID 核对 |
| 资产详情 | `/projects/:id/assets/:assetId` | M31 BASELINE_REUSE | 实际版本授权与下载的 SHA |
| 项目列表 | `/api/runtime/projects` 后端 MySQL | M31 READ_PATH_EXISTS | 真实个人登录与原始审计 |
| 能力池 | `/api/runtime/capabilities` | ADMIN_ONLY_READ_PATH | 用户 Role/Security scope 验证 |
| 知识库 | `/api/runtime/projects/:id/knowledge-bindings` | M31 READ_PATH_EXISTS | 用户可读性、授权隔离与非空数据 |
| 写入闭环 | `POST /api/runtime/projects` + `CONSOLE_ALLOW_WRITES` | STAGING_WRITES_OFF | Human 授权非生产环境临时开启并完成 DB/audit/reload 测试 |

## 缺口分类与 Gate

1. **P0 需求闭合**：定位 M32.1 的正式范围、交互验收目标和 DoD；没有则依 Master Blueprint 的 Change/Impact 流程补定义，但不得自动把已实现 M31 改名为 M32.1。
2. **P0 真实性验证**：独立的真实登录、原始 Runtime/MySQL 项目 CRUD、授权下载及 Audit E2E；对 CI fixture 与线上真实数据明确标记不同证据级别。
3. **P0 发布追踪**：M32.1 Exact Commit → CI Run → Build Artifact → Staging Deployment → Operator/Health；目前以上 M32.1 的源匹配链缺失。
4. **P1 视觉及交互专项**：在完整需求确定之后进行，不要求先重写已存在 M31 的路由。
5. **不得重复的 PASS**：已核验的 M31 列表、路由实现与历史 CI 证据，除非上游代码或接口本身发生了实际变化。

## 与发布门禁关系

- M32.1: `UNVERIFIED`（不冒认）。
- M32.5 平台发布：`HOLD`，C19 外部 AIGC 发布/短剧资产验收仅独立报告，**不作为平台生产发布硬门槛**。
- Production 未操作；不执行 staging writes 或真实回滚；Draft PR #14 保持 Draft。

下一步：确认 M32.1 的唯一需求原始事实源；如果无正式定义，应先在明确范围内创建需求/验收矩阵，再以现有 M31 源码增量实现真正缺失功能。
