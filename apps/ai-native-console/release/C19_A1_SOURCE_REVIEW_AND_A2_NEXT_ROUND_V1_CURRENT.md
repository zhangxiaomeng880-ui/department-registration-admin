# C19-A1 发布源候选与 C19-A2 复盘准备｜2026-10-08 CURRENT

> **2026-10-08 A0 首帧字幕试验 · 增量勘误：** 本轮直接抽取 t=0–1.75s 帧，确认字幕约 **0.75s 开始淡入、约 1s 可读**。下文“标题约 2s 起”属于旧的主观粗估，已被真实逐帧核验更正。实验应称为“首帧可读”而非“提前约两秒”。已经制作的 `C19_A1_A0_FIRST_FRAME_CAPTION_PREVIEW_ONLY.mp4` 只是一份**内部比较预览**，技术 QA 记录在 `C19_A1_A0_OPENING_PREVIEW_V1_REVIEW_ONLY.md`；它没有得到创作批准，也没有对外发布，不是 C19-A2 下一轮真实 E2E 证明。


## 状态 / 决策
- **C19-A1 Source Recovery = HIGH-CONFIDENCE CANDIDATE FOUND / HUMAN SOURCE BINDING HOLD**。
- **C19-A1 Publication + Real Performance = REUSE / PASS ON THOSE FACTS ONLY**，不重复发布。
- **C19-A1 Real AIGC E2E = HOLD**：Human Review、Archive/FROZEN 及真实来源绑定未完成。
- **C19-A2 Real Result → Decision → Next Round = DECISION PREPARED / HUMAN GATE**。没有授权新发布、没有宣称已执行下一轮。

## 1. 证据回收（读取原文件，未覆盖/移动）
| 比较项 | 候选 `kf01_tonight_v01.mp4` | `KF01_jinwanbuganlu_micro_motion_v01.mp4` |
| --- | --- | --- |
| 来源 | ChatGPT Library 原文件的只读工作副本 | 同上 |
| 大小 | **4,011,967 bytes** | 828,281 bytes |
| 长度 | **12.000s** | 12.005s |
| 分辨率 | **1080×1920，竖屏** | 720×1280 |
| 视频 / 音频 | H.264 + AAC（48kHz 双声道） | H.264 + AAC |
| 画面 | 夜晚海边的林夏，背景城市灯光 | 同一类型母画面 |
| 字幕 | **“昨天，我又梦到你了”**（约 2s 起持续出现） | 未见相同叠字 |
| SHA-256 | **`d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`** | `7af6e77a715ad712e183ef7486f16c0ffb63278750064aa7fa2fe3b91b6cfd54` |

小红书真实创作者数据 `C19_A1_XHS_PERFORMANCE_2026-10-08_OVERVIEW.jpg` 的封面缩略图是夜晚海边的同一人物构图，页面标题为 `昨天，我又梦到你了`。因此第一个文件成为首选，第二个视为上游片段候选，不作为已发布源文件。

**证据强度**：本地候选原文件的 SHA 是实际计算而得；12s、画面和文字与平台截图相符。仍**没有**上传文件的导出/上传流水线回执，也未获得用户对“上面这个具体本地文件就是发布时使用的源 MP4”的明确确认。平台通常会转码，因此不以平台端字节相同作为源文件验收前提，而以 **上传前的源 MP4 可核验 + 用户确认的准确身份 + 原制作/发布证据链** 作为必要条件。

当前 `exactSourceMp4Sha256 = null`，不得把候选 SHA 直接填写成已经审批的正式发行 Master。此前被错误绑定的 11s 无剧透 Master V0.2 必须继续标记 SUPERSEDED / INTERNAL CANDIDATE ONLY。

## 2. 真实表现数据（只根据正式平台截图，不猜测）
- 10/08 Snapshot：曝光 **202**，观看 **88**，封面点击率 **6.3%**。
- 2 秒退出率 **42.4%**，5 秒完播率 **25%**，平均观看时长 **3.7 秒**，全片完播率 **11.7%**。
- 截图时互动数据为 0；未提供历史对照、分流实验或足够大的采样证据，不能断言某一封面或 BGM 导致退出率，也不能声称任何改动必然增长。

## 3. 人工 Review 的待选决策（不自动替作者签字）

**推荐测试方向：优先优化头 2 秒的进入方式，而不是修改故事内核。** 当前片段 0.5s 为静态人物海边镜头；标题叠字约 2s 起出现，与部分观众在 2s 前退出的行为在时间上存在可探索的联系，但这不是因果结论。

- **A. 提前开篇钩子（优先候选）**：在 0–0.8s 提前出现一句独立于剧情、自然节制的文本钩子；保留原林夏、原海边镜头、12s 节奏、原始音乐来源和人物 Identity Lock。避免直白煽情、误导“BE”、增加狗血反转。只针对现有已获准的原始影像做 Shot 级非破坏性衍生，保留 V1。
- **B. 保留片中文字时点，调整封面传达**：封面更明确地表达人物情绪与生活感，保持电影写实质感与可辨认主体；优先用既有片源选帧，不重新生成/修改角色 Identity。

可先在本地建立两版明确命名的 `CANDIDATE`，但只有作者确认选择和 Rights Gate 后才进入下一轮真实外部发布；由平台数据回收、人工评估后形成新的 Loop Closure。**本轮没有生成视频、修改母版或执行外发**。

## 4. 剩余 Gate
- Human：确认候选源文件身份、审核本人对本条真实表现的创作解释/方向。
- Engineering：在已获准的 Source 版本绑定后，证明 SHA、授权、Rights、Review Archive/FROZEN 与 Runtime ID。
- Publication：下一条外发须另有明确授权；真实结果数据、Human Decision、Next Round 执行、Knowledge/Backlog 回写后才能对 C19-A2 出具 HUMAN/non-synthetic 结果。
- M32.4.4：证据仍为 `HOLD_NOT_FOUND`；本文件不构成 M32 Workbench Release Trace。

冻结规则：原始媒体保留、优先证据绑定，不清理候选、不可填造平台上传时间或文件 hash。
