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


## 2026-10-08｜证据回收增量（第二轮，继承前轮 Gate）

- **C19-P1 CLOSED/PASS 历史证据重新找回**：来自用户正式 Library CURRENT 的项目检查点；GitHub Run `37561607586` 独立调用 API 验证 completed/success、SHA `ab5ad26c658a1cd1ce9f869b7d95ba54511808fd`。标记 `PASS_REUSED`，不重跑 M27 产品真实 E2E。
- **C19-P2 CLOSED/PASS 历史证据重新找回**：Library CURRENT 保留人工作出的 HUMAN/APPROVED、non-synthetic 和 `realExternalOutcome=true` 结论；GitHub Run `37712613211` independently success、SHA `25c6c92de126dd409db5f1359b23103d8ca98d12`；Railway 历史 deployment `f06617c5-8444-44de-a6ac-13ca19fb89de` 已被后续成功服务版本替换，现显示 `REMOVED` **不等于原部署失败**。该轮没有重新登录 Runtime 查询证明记录当前存在：`PASS_REUSED/HISTORICAL_VERIFIED`，不重复人工作出批准。
- **C19-A1**：实际小红书视频与平台表现存在真实发布/分析证据，但已发布 Master 源 MP4 SHA-256 尚未找回，Review→Archive 未闭环；旧无剧透 11s 候选视频不得错误绑定为已发布 12s 作品。
- **C19-A2**：真实表现快照已具备；尚无通过人工作出的决策及“结果→执行下一轮→回写→证明”可核验闭环。
- **M32.4.4 Release Trace**：没有在已连接 GitHub 两仓库与 Google Drive 中找到对应正式 CURRENT/Run/Deployment。现保存 `M32_4_4_TRACE_RECOVERY_V1_CURRENT.json`，其中仅证实 M31.5 的前后端 pinned SHA 与匹配 GitHub CI Run；**不得将 M31.5 的真实追踪冒充 M32.4.4 PASS**。Operator、M32 版本、Rollback Receipt 留空并维持 HOLD。
- **Gate 引擎更新**：C19-P1/P2 采用 `PASS_REUSED` 并保留精确 Run 回执；C19-A1/A2 独立设为硬性阻塞：没有发布 Master SHA + HUMAN Review/Archive、以及 HUMAN/realExternalOutcome 下一轮证据，无法晋级 FINAL。
- 追加 2 项隔离合约测试后，GitHub Actions Run [37778539152](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37778539152) **10/10 PASS**。当前 CURRENT manifest 判定 **M32.5 FINAL RELEASE HOLD，18 条阻塞（包含 2 条明确的 C19 AIGC 人工真实证据）**。CI 通过不代表 18 条阻塞已经解决。
- 查找 Library 中的 MP4 可见若干视觉制作候选与历史视频，但**不能仅凭相似文件名/时长将任何一个与已发布视频字节等同**；不搬动、不更名、不绑定、不虚构来源 SHA。

**第二轮断点**：`M32_5_C19_P1_P2_REUSED__A1_A2_REAL_HOLD__M32_4_4_TRACE_HOLD`。下一步只收集已存在的原始 Master / 对应发布过程身份证据以及原 M32.4.4 Trace 的确切路径。需要创作取舍、发布、主文件归档签名、生产操作时走 Human Gate。


## 2026-10-08｜A1 已发布视频候选原始文件回收与 Human Review 准备

- 从用户 ChatGPT Library 原始文件字节（未作任何改写）恢复两份 12s 带音轨的 KF01 海边视频；本地通过 `ffprobe` 核对时长/码流/分辨率，并对完整原始 MP4 计算 SHA-256。
- `kf01_tonight_v01.mp4`：12.000s、1080×1920、H264+AAC，底部直接可见字幕“昨天，我又梦到你了。”；真实源候选哈希 `d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`。
- `KF01_jinwanbuganlu_micro_motion_v01.mp4`：12.005s、720×1280、H264+AAC、抽样帧无字幕；真实源候选哈希 `7af6e77a715ad712e183ef7486f16c0ffb63278750064aa7fa2fe3b91b6cfd54`。
- 另外 3 份按画面/时长排除；候选比对档案：`C19_A1_MP4_SOURCE_CANDIDATES_V1_CURRENT.json`。作品的公开发文标题是“昨天，我又梦到你了”，**不能直接等价为作者实际上传了哪一个 MP4**；平台短链无法在当前浏览环境读取真实上传源文件字节。
- 新增 `C19_A1_A2_HUMAN_REVIEW_AND_NEXT_ROUND_V1_READY.md`：基于真实数据（2s 退出 42.4%、5s 完成 25%、平均 3.7s、完播 11.7%），建议先在 0–2s 字幕情绪钩子做单变量实验，**只是建议稿，作者尚未 APPROVED，不发布，不修改剧本事实**。
- Gate 引擎新增安全要求：真实候选文件的哈希 **不是** 已上传版本的 `publishedSourceBinding`；需要作者正式来源认定后才能继续 Review/Archive 资格判定。相关隔离测试 Run [37779682708](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37779682708) **11/11 PASS**。正式 Release Gate **HOLD（18 阻塞项）**。
- **未修改正式影视素材、没有上传 S3、没有实际发布下一轮、未修改 Railway Staging / Production**。仅完成了真实证据文件候选恢复、评审准备及受控门禁增强。

本轮检查点：`M32_5_C19_P1_P2_REUSED__A1_REAL_12S_SOURCE_CANDIDATES_HASHED__PUBLISHED_SOURCE_HUMAN_BINDING_HOLD__A2_DECISION_HOLD__M32_4_4_TRACE_HOLD`。
