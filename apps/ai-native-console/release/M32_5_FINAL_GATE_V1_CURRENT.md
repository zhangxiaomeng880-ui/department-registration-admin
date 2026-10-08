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

## 2026-10-08｜C19-A1 本地候选源 SHA 及影像互证（第三轮，继承前轮 PASS）

- 从用户 Library 的真实 MP4 只读 materialize 并用 `ffprobe`、`sha256sum`、抽帧逐一核验 4 个候选。**已找到同一夜海边、12.000 秒、1080×1920、标题“昨天，我又梦到你了”的强匹配源候选 `kf01_tonight_v01.mp4`**，实际字节大小 `4011967`，SHA-256 **`d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`**；H.264 + AAC (48kHz stereo)，300 video frames。
- 发布数据页真实截图的封面缩略图与候选文件均呈相同的夜晚海边林夏场景，标题亦一致；**匹配的是内容/封面，而不是已验证平台上传源文件字节身份**。用户未就此具体本地 MP4 做上传源确认，原始导出/上传流水线回执缺失。正确状态是 `SOURCE_CANDIDATE_HASH_VERIFIED / UPLOADED_SOURCE_BINDING_HOLD`，`exactSourceMp4Sha256` 继续为 `null`。
- `KF01_jinwanbuganlu_micro_motion_v01.mp4` 也是 12 秒母画面候选，但不同分辨率且没有相同标题叠字；不得替代实际发布成片。
- 已保存 `C19_A1_SOURCE_REVIEW_AND_A2_NEXT_ROUND_V1_CURRENT.md`：小红书真实 202 曝光/88 观看、42.4% 2秒退出与 11.7% 完播背景下的两种优化方向（提前前 2 秒情绪钩子；或先调封面表达）。**方案仅供 Human Review，不改母版/人物 Identity、不重新发布、未生成下一轮视频**。
- M32.5 审核器新增 `publishedSourceBinding.sha256` + `humanConfirmedUploadSource=true` + `evidenceRef` 三项，且需与 `exactSourceMp4Sha256` 一致；不能直接将 sourceCandidate 的真实 hash 复制成发行正式 Master 证明。
- [GitHub CI 37779682708](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37779682708) **11/11 PASS**；`M32.5 FINAL = HOLD / 18 blockers` 不变（这 18 项包含先前尚无的 M32 upstream 正式证据及真实 E2E 等）。C19-P1/P2 复用 PASS，不重跑。
- `M32.4.4` 正式 Release Trace 仍未在可访问的 GitHub、Google Drive 和既往信息中找到；沿用上一轮明确的 `HOLD_NOT_FOUND`，禁止用 M31.5 的 CI/部署替代。

**下一检查点**：`M32_5_C19_A1_SOURCE_CANDIDATE_SHA_VERIFIED__HUMAN_UPLOAD_SOURCE_CONFIRMATION_HOLD__A2_REVIEW_DECISION_HOLD__M32_4_4_TRACE_HOLD`。原文件与发布事实不做不可逆修改；人工作出准确“这是发布时上传前 MP4”的确认及创作方向确认后，才允许独立的源身份归档/Review 迁移。


## 2026-10-08｜C19-A1 人工视觉版本确认证据收口

- 作者在此轮对“实际小红书发布的是画面底部带『昨天，我又梦到你了。』字幕的那组吗？”明确答复：**是的**。其确认范围是视觉画面/字幕版本，`HUMAN_VISUAL_IDENTITY_CONFIRMATION = PASS`。
- 唯一正式确认入口：`C19_A1_HUMAN_VISUAL_IDENTITY_CONFIRMATION_V1_CURRENT.md`；对应真实 Library 候选是 `kf01_tonight_v01.mp4`，原始候选文件 SHA-256 为 `d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`。
- 用户确认**不包括**“平台上传前的原始 MP4 字节一定等于该本地文件”，故 `exactSourceMp4Sha256=null`、`humanConfirmedUploadSource=false`，不写入 Archive 正式字段。与此确认同时新增的对照文档只为非唯一辅助证据，不形成第二套正式 CURRENT 状态。
- 已同步 `M32_5_EVIDENCE_V1_CURRENT.json` 的 `criterion19.C19-A1.publishedVisualIdentity.status=PASS_HUMAN_CONFIRMED`，并保留 source byte / Human Review / C19-A2 全部 HOLD。
- 此次不是对优化方向、下一轮发布、版权转移或 Production 晋级的批准。**既有 C19-P1/P2 PASS 不重跑**。

当前断点：`M32_5_C19_A1_HUMAN_VISUAL_CONFIRMED__ORIGINAL_UPLOAD_BYTE_HOLD__HUMAN_REVIEW_HOLD__C19_A2_HOLD__M32_4_4_HOLD`。


## 2026-10-08｜C19-A2 私有剪辑候选已实做

- 基于用户已确认视觉版本的 Library 原始 MP4（本地字节哈希 `d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`），复核 `0.3s` 无字幕、`1.0s` 淡入、`1.5s` 清晰。纠正先前“到第 2 秒才有字幕”的不精确说法，不能将 2s 退出全部归因于字幕偏晚。
- **实际输出** 非破坏性本地私有样片 `C19_A1_KF01_OPENING_REVEAL_V0.1_CANDIDATE.mp4`，首 1.8 秒轻微数字近景→原景（最大约 1.16x），以验证画面尺度变量而非改故事、人物、台词或音轨。只在工作容器，不外发、不写入正式资产目录。
- **技术 QA 实测**：12.000 秒、1080×1920、25fps、300 帧、H.264 + AAC；候选 2,356,440 字节，文件 SHA-256 `ad2801f33838750dd7512edae400df285ed532d436a6b5c861b646b691ebd801`。源与候选完整 AAC bitstream hash 同为 `17dc02a1d10455e8b43dc49486e87a921341fc12bee9b3efbc2264c84f6704a9`；2s 后画面对源文件 SSIM All≈0.990185，属于转码差异范围，**不是创意或传播效果 PASS**。
- 新增 `C19_A2_LOCAL_OPENING_REVEAL_V0.1_READY.md` 记录真实候选、技术验收和门禁；`M32_5_EVIDENCE_V1_CURRENT.json` 仅提升到 `PRIVATE_PREVIEW_TECH_QA_PASS`，无创作批准、无 A2 真实发布或次轮表现。
- **仍 HOLD**：原已发布源 MP4 精确上传字节映射、Human Creative Review、Archive、A2 真人下一轮及外部结果、M32.4.4 正式 Release Trace、Production Gate。原发布无需重做，P1/P2 不重跑。

续跑检查点：`M32_5_SOURCE_UPLOAD_MAPPING_HOLD__A2_LOCAL_CANDIDATE_TECH_PASS__A2_HUMAN_CREATIVE_GATE__REAL_PUBLICATION_HOLD__M32_4_4_TRACE_HOLD`。


## 2026-10-08｜C19-A1 A0 首帧字幕内部预览 QA / 真实发布时间证据继续 HOLD

- 已使用之前作者确认的字幕版 `kf01_tonight_v01.mp4`（Library 只读源；SHA-256 `d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`）制作仅在工作目录的 `C19_A1_A0_FIRST_FRAME_CAPTION_PREVIEW_ONLY.mp4`，非正式 Master、不上传、不发布，源文件不覆盖。
- 逐帧纠偏：原片字幕约 0.75s 已开始淡入，约 1s 可读，而非旧评审粗估“2 秒才出现”；实际 A0 仅对“首帧字幕可读性”做变化。
- 预览保留 12.000s；预览 SHA-256 `57c608d29912effe2a761dab8c22ee092c959c4502017f67369a2c32b3fd9ab4`，原片与预览 AAC 音轨 demux SHA 同为 `792081cce95b0dd592bf4476bd1ddc4e5be92c6900d3e000a481836282355a02`；视频重编码不代表画质无损。
- 真实证据和内部预览分离：新增 `C19_A1_A0_OPENING_PREVIEW_V1_REVIEW_ONLY.md`，并同步 `M32_5_EVIDENCE_V1_CURRENT.json`。**A0 TECH QA PASS ≠ Human Review 决策/真实发布/表现/执行自闭环 PASS。**
- 对上传原件做本地 metadata 核验未发现平台上传映射、上传前文件回执，Google Drive 原始文件名精确搜索无结果。此轮没有补齐上传前原始成片和平台发布的字节级同一性证据；保留 `exactSourceMp4Sha256=null`，不将作者此前对“视觉版本”的确认扩展成上传原文件身份确认。
- M32.5 证据合约测试 Run [37781673439](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37781673439) **14/14 PASS**；Final Gate 仍 **HOLD / 18 blocker 条目**。既有 C19-P1/P2 PASS 复用。

当前检查点：`M32_5_C19_A0_PREVIEW_QA_PASS__PUBLISHED_MASTER_ORIGINAL_BYTES_HOLD__HUMAN_REVIEW_HOLD__C19_A2_EXTERNAL_NEXT_ROUND_HOLD__M32_4_4_TRACE_HOLD`。未改变任何 Production/Staging 对外服务或正式发布内容。

## 2026-10-08｜M32.5 平台 Gate 与 C19 内容外发验收正式解耦

- 确认原审核器误将 C19-A1/A2 的实际短剧发布结果和其 AIGC 外发 E2E 同列平台晋级硬门槛，导致研发主线与内容制作混用。
- 本轮直接修改 `m32-5-final-gate.mjs`：保留 `CRITERION_19_REAL_BUSINESS_E2E` 独立 `businessAcceptance` 判定；移除 C19-A1/A2/C19-AIGC 外发流对 `M32.5_WORKBENCH_FINAL_RELEASE` 平台 blockers 的直接耦合。Product C19 P1/P2 的历史 PASS 仍独立复用，不伪造视频发布结果。
- GitHub CI Run [37787620198](https://github.com/zhangxiaomeng880-ui/department-registration-admin/actions/runs/37787620198)：**15/15 tests PASS**；当前平台真实 Gate **HOLD / 15 blockers**，独立 C19 业务 **HOLD / 3 blockers**。没有删去或跳过 M32.1–M32.4.4、平台真实受限账号 E2E、release trace、回滚、生产授权、独立签名等平台证明。
- 后续默认执行平台发布主线；C19 外部视频发布不再自动推进、不会用于替代平台发布证据。Production 未经明确授权不得变更。

检查点：`M32_5_PLATFORM_RELEASE_SPLIT_PASS_TESTED__PLATFORM_15_HOLD__C19_BUSINESS_3_HOLD__M32_4_4_EVIDENCE_TRACE_HOLD`。
