# M32.1｜工作台需求和验收矩阵 V0.1 CURRENT

2026-10-08 · DRAFT_SCOPE_FROM_EXISTING_MASTER_AND_M31 · IMPLEMENTATION_NOT_APPROVED · GATE HOLD

## 边界与口径
这是在尚未找到唯一 M32.1 原始需求单前的**候选范围**，不作为用户已经批准的新里程碑，不将 M31 的能力重新命名成 M32.1 PASS。以 AI Native 2.0 MASTER BLUEPRINT V1.4 FROZEN 的真实项目/Workflow/角色/能力/知识/资产/数据/证据原则以及 M31 实际工作台代码为依据；功能事实必须有源代码或真实运行回执。

## 需求与验收矩阵
| 编号 | 用户结果/需求 | 已有 M31 事实 | 验收动作与可核查证据 | 状态 | 优先级 |
|---|---|---|---|---|---|
| R01 | 左侧导航进入独立可分享页面 | app.js /projects /capabilities /knowledge | 登录后直接访问、刷新、返回、前进；URL 与内容对应；非授权拒绝 | CODE_EXISTS / LIVE_HOLD | P0 |
| R02 | 项目列表打开专属项目空间，六个 Tab 分页 | /projects/:id/{overview,tasks,assets,data,stages,audit} | 用真实 MySQL 项目，项目 ID 保持一致、Tab/直接访问不串数据 | CODE_EXISTS / LIVE_HOLD | P0 |
| R03 | 任务、资产进入独立详情 | /projects/:id/tasks/:taskId、assets/:assetId | 详情必须绑定同一 Project/Runtime 原始 ID；跨租户越权为拒绝 | CODE_EXISTS / LIVE_HOLD | P0 |
| R04 | 列表、工作区、资产、知识来源真实且可恢复 | Runtime API 读取路径和 read-guards.mjs | 网络异常/切换项目时不显示旧项目数据；刷新数据仍来自 Runtime | FIXTURE_PASS / LIVE_HOLD | P0 |
| R05 | 项目创建后刷新可见并留下真实审计 | POST projects 仅在显式权限和开关满足时可用；Staging writes OFF | Staging 专用身份执行创建→reload→原始审计；不改 Production；测试后清理策略受审批 | BLOCKED_BY_WRITE_GATE | P0 |
| R06 | 能力池和知识库根据角色隔离 | 平台管理员能力池；项目 knowledge-bindings 读取 | 普通用户对未授权能力/项目必须 HTTP 403/404；不可静默模拟 | CODE_EXISTS / LIVE_HOLD | P0 |
| R07 | 资产版本下载具备授权解析和真实 SHA | M31 仅登记 file_id，README 明确 resolver 单独门禁 | 被授权用户成功下载可验 SHA；撤权后访问确实被拒 | BLOCKED_BY_AUTHORIZED_OBJECT | P0 |
| R08 | 发布追踪与回滚可审计 | M32.5 仅有 M31 历史 trace | Exact SHA→CI→Build→Deployment→Health→Rollback receipt 成链 | NO_M32_RECEIPT | P0 |
| R09 | 平台发布与具体 AIGC 内容发布分离 | M32.5 gate 已拆 businessAcceptance | C19 外部业务 HOLD 时，仍只由平台本身门禁决定平台 RELEASE_READY | CONTRACT_TEST_PASS | P0 |
| R10 | 中文模块名、无虚假成功反馈 | app.js 中文标签与真实错误呈现 | 浏览器中文及空/失败/无权界面核查，按钮不虚报成功 | PARTIAL_FIXTURE_PASS | P1 |

## DoD 及不能跨越的门禁
- 本表“代码存在”≠“真实 Staging 验证 PASS”；fixture E2E 不可替代授权个人用户访问。
- P0 成功需有：唯一验收目标、exact commit、CI、build、staging deployment、登录主体/Role、Runtime 与 MySQL 数据证据、审计/安全负向证据。
- 写入、对象授权/撤权和回滚仅能在单独批准的可控 Staging 范围执行；Production 需明确人工批准。
- M32.1 状态仍 UNVERIFIED，直到范围经过正式确认且验收回执独立可核。
- 真实业务 C19 依旧独立报告；不要求再次上传小红书视频来验平台。

## 增量执行顺序
1. 以 R01–R10 对照现有 Console/Runtime 接口和测试得到差异；保留已通过的 M31 测试结果。
2. 优先完成不需要写权限的 R01–R04、R06、R10 的真实 Staging 已登录只读验证。
3. R05、R07 与 R08 各自获取 Staging 测试身份/真实权利对象/回滚演练所需单独操作许可和可追踪凭据，再验证。
4. 形成 M32.1 exact SHA/CI/Build/Deployment 对应的实际发布回执后才允许提升上游门禁。

下一检查点：此文为 CANDIDATE_REQUIREMENTS；如果补到真正 M32.1 原始需求，以原始需求优先核对、记录差异，再修订本矩阵。