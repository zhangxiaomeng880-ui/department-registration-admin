# AI Native 2.0 · M32.5 Workbench Final Release Gate — CURRENT V1.0

核验日期：2026-10-08
工作分支：`feat/ai-native-m32-5-final-release-gate`
目标：**不重跑已 PASS 的事实**，独立绑定 M32 上游、Release Evidence Trace、真实 Staging E2E、回滚和 Human Gate，并输出可复现的收口判定。

## 本轮执行结果

- **M32.5 Evidence Contract 实施与测试：PASS**。CI [37777421521](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37777421521) success。
- **M32.5 最终发布 Gate：HOLD**。这是读取 CURRENT 证据后的真实阻塞结论；不能将“验证程序 CI 通过”解释为“Production 可发布”。
- **Staging 存活验收：PASS**。Railway Staging Console、Runtime、MySQL 三服务当前在线、各自部署 SUCCESS，环境无 staged patch。
- **Production：未修改 / 未批准新的 M32 发布**。Production Runtime 和 MySQL 在线；未触发发布、合并或数据清理。

## 实证锚点

| 系统 | 已核验的版本 | 状态与含义 |
| --- | --- | --- |
| Staging Console | deployment `48ab1d6c-efac-4a8c-b752-4c80822e60fb`; pinned SHA `9c55c313a21d248247d7ac58d056644ba703d732` | Online / SUCCESS；此部署为 M31.5，**不是已证实的 M32.4.4** |
| Staging Runtime | deployment `7d65ddf5-4edb-4694-9707-1493ce75bde8`; pinned SHA `7eb6c9d4f244b23f52ed90bc9ef801e776726a57` | Online / SUCCESS；同上 |
| Staging MySQL | deployment `10204672-ba09-4ca8-b35b-3dcad3db44ac` | Online / SUCCESS |
| M31.5 anonymous HTTP security | GitHub run `37732093238` | /ready 200；未登录 Console /access 401、Runtime /access 401、Console /content 401；**不等于个人用户正向打开 E2E** |
| Console feature code current branch | `78a8fd8d3c480098b071aff1e056df25ccd6291a` (checked) | 最新代码不同于 Staging PIN；不可把分支 CI 冒充部署 SHA |

M32.1、M32.2、M32.3、M32.4、M32.4.4 在先前工作记录中被描述为 PASS；但本轮连通的 GitHub 两仓库与 Google Drive 检索均未返回对应的 M32 正式 CURRENT、独立 GitHub Actions Run/提交链及 Railway 部署证据。因此本次判定 **UNVERIFIED**，并未宣称先前工作失败，也不删除或重跑其成果。

## M32.5 强制 Gate

1. **上游五项证据**：每项 PASS 必须有相匹配的 GitHub Actions ID/URL、success、commit SHA 与实际独立读取回执，不接受仅凭状态文字。
2. **发布证据链**：Release 的 branch、commit SHA、build ID、test run ID、version、environment；Deployment 的环境、版本、SHA、执行人、时间、结果；Rollback 的 old/new SHA、原因、操作人、时间、演练结果。提交须与 pinned live service 一致。
3. **个人用户端到端**：真实个人 scoped 账号登录、项目写入/刷新/原始审计、正向版本文件授权下载与 SHA-256、撤销后拒绝、AIGC 发布→表现→复盘→下一轮、正式 Release Trace 和安全回滚演练。**fixture/匿名 smoke 不可替代**。
4. **环境与安全**：Runtime Ready，匿名访问 401，默认写入关闭，无悬空 staged patch，无生产变更，正式生产晋级须 Human Gate。
5. **抗篡改**：独立证据核验者必须对整个冻结 Manifest 摘要进行 Ed25519 签名，并由发布检查器使用可信公钥验证；没有签名、公钥或人工批准，结果只能 HOLD。

## 实现文件

- `apps/ai-native-console/release/m32-5-final-gate.mjs`：评估器，默认输出阻塞理由；显式 `--require-pass` 时不满足 Gate 返回非零退出码。
- `apps/ai-native-console/release/M32_5_EVIDENCE_V1_CURRENT.json`：当前真实核验快照，不包含秘钥/Token；外部上游证据未找到时标记 UNVERIFIED。
- `apps/ai-native-console/tests/m32-5-final-gate.test.mjs`：8 项隔离测试，包括人工篡改/错误 release commit/缺回滚/缺证据/签名缺失仍拒绝。
- `.github/workflows/ai-native-m32-5-final-gate.yml`：执行代码与证据合同 QA；仅手动明确执行 Release Ready Gate 才启用 `--require-pass`；**不包含部署 Production 的步骤**。

## 续跑检查点

当前阶段 **M32.5 / EVIDENCE_CAPTURE / HOLD**。

下一步按优先级补齐或读取已有的 M32.1–M32.4.4 正式 Run/Commit/Checkpoint；对所有原来 PASS 且上游不变的部分**仅绑定现成证据，不重新开发或重新跑 QA**。之后依次完成受限真实用户读取+撤权、真实授权资产下载、Release Trace、Rollback rehearsal；收口后才进入人工 Production Gate。

禁止操作：Production 发布、正式资产覆盖/删除、为凑测试私自放开写入或编造签名及历史证据。
