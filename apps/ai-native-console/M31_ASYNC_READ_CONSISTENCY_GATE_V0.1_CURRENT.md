# AI Native 2.0 / M31 — 异步读取与项目隔离 Gate V0.1 CURRENT

**日期：** 2026-10-08  
**对象：** ai-native-console, `feat/ai-native-console-real-binding-m31`  
**判定：** ISOLATED FRONTEND READ-CONSISTENCY GATE = PASS；REAL AUTHENTICATED BROWSER E2E = HOLD；FULL FRONTEND RELEASE = HOLD。  
**权限范围：** 未触及 Production、未开放写入、未上传/覆盖媒体与资产、未修改正式冻结基线。

## 代码与不可变证据

- 测试代码 SHA：`d084cd497d6111c02be0fe4858f0711cba4f498e`。
- 控制台 CI [run 37737380543](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37737380543)：**SUCCESS**，console-gate 和 browser-contract 通过。
- 独立 Release Gate [run 37737380532](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37737380532)：**SUCCESS**（并不等于产品获准发布）。
- 正式部署 Staging Console 暂仍为 Railway `48ab1d6c-efac-4a8c-b752-4c80822e60fb` SUCCESS，配置 source commit `9c55c313a21d248247d7ac58d056644ba703d732`；以上新代码 **未声称已部署**。

## 本轮修复范围

1. 工作空间切换：立即清除上一空间的项目卡片并撤销旧路由请求；分页查询必须同时匹配 workspaceId 和最新 nonce，否则不允许入库到页面状态。
2. 项目资产：任何资产领域请求的异步回包必须同时匹配路由版本、请求 nonce、projectId、当前页面 `/projects/{id}/assets` 和当前领域选择；否则丢弃。
3. 知识库：知识源回包只在 routeVersion、nonce、workspaceId、当前项目与知识库路由一致时展示；请求失败也不得擦写新页面。
4. 使用无第三方依赖的 `public/read-guards.mjs` 执行纯状态门控；`server.mjs` 仅增加严格静态 allowlist 中的同源脚本路径。

## 验收与适用边界

| 项目 | 结果 | 证据边界 |
| --- | --- | --- |
| Node 静态、BFF 鉴权、路由一致性单测 | PASS | CI 纯代码与隔离数据 |
| Playwright 真实浏览器模拟旧领域请求晚返回 | PASS | `M31_ASSET_RACE_PASS`；隔离 Stub Runtime，旧 HTTP 200 不得覆盖新资产 |
| AIGC 15 阶段精确顺序、重复项、错误模板/版本、上游失败的前端判定 | PASS | `M31_AIGC_15_STAGE_STRUCTURE_TEST_PASS`；仅隔离测试数据，不是 Staging 真实 AIGC 工作流实例验收 |
| 项目内多页面、任务/资产详情、刷新、返回和退出 | PASS | `M31_MULTI_PAGE_ROUTING_PASS`；隔离浏览器模拟鉴权 |
| 实际 Staging HTTPS 桌面/手机端匿名访问、11 个深链地址、未经鉴权不能读取 | PASS | `M31_LIVE_BROWSER_UNAUTH_PASS`；是实际部署但 **未登录** 的 shell 测试 |
| 真实项目登录、跨项目授权、真实 15 阶段工作流、文件内容访问 | HOLD | 未完成实际用户鉴权端到端测试 |
| 实际 Staging 写入、审计持久化、完整 Agent/Checkpoint/Gate | HOLD | 写入保持关闭，未执行 |
| Production | NOT TOUCHED | 无任何 M31 生产晋级或部署 |

## 下一检查点

优先使用 **个人受限 Runtime 凭据** 验证真实 Staging 浏览器登录→工作空间→两个真实项目切换→阶段、资产、原始审计读取→刷新/退出；凭据绝不写入测试源码、浏览器持久存储或日志。随后核验真实 AIGC 15 阶段工作流实例。需额外授权的写入、发布、唯一 CURRENT/FROZEN 替换仍停 Human Gate。已 PASS 项上游不变时不得重跑。
