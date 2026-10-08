> **补充对照记录 / 非唯一正式 CURRENT 入口。** 已存在的正式基线是 `C19_A1_HUMAN_VISUAL_IDENTITY_CONFIRMATION_V1_CURRENT.md`；本文件仅作为本轮并行记录的可追溯副证，不作为另一个发布主状态，也不单独推动 Gate。后续资料库清理由人工 Gate 处理是否合并，暂不删除。

# C19-A1｜已发布视觉版本作者确认｜补充对照记录

- 日期：2026-10-08（用户所在时区 +08:00）
- 项目：《你好，那年夏天》
- 平台：小红书（Xiaohongshu）
- 已发布内容内部名：《昨天，我梦到你了》
- 平台笔记标题：《昨天，我又梦到你了》
- 已知公开短链：`https://xhslink.cn/o/4ILh99q7xE7`
- 事实确认来源：用户在本次 ChatGPT 对话中，针对“你实际发布到小红书的，是下面那组带‘昨天，我又梦到你了。’字幕的画面吗？”直接回答：**“是的”**。
- 证据类型：`HUMAN_VISUAL_VERSION_CONFIRMATION`。
- 审核结论：`PUBLISHED_VISUAL_VERSION_CONFIRMED / SOURCE_UPLOAD_BYTES_NOT_YET_PROVEN`。

## 已确认

用户确认已发布的是**画面底部带“昨天，我又梦到你了。”字幕的 12 秒版本**，而不是抽样无字幕的 KF01 micro-motion 素材，也不是此前误绑定的 11 秒无剧透记忆前奏候选。

与该视觉版相匹配、已从用户 Library 只读恢复的文件：

- 原始库文件：`kf01_tonight_v01.mp4`
- Library file id：`file_0000000090a882308460974cdd972ffc`
- 时长：`12.000s`
- 画幅：`1080 × 1920`
- 视频/音频：`H.264 / AAC`
- 实际本地原始文件完整 SHA-256：`d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`
- 文件确认：SHA-256 对该 Library 文件的实际原始字节计算；非从文件名/图片推断。

## 尚未确认，不能越权升级

本次用户确认的对象是**发布画面/视觉版本**，而不是通过上传前导出文件流水线核验“恰为上述 4,011,967 字节 MP4”。因此：

- `humanConfirmedPublishedVisualVersion = true`
- `humanConfirmedUploadSource = false`
- `publishedVideoSha256 = null`
- `exactSourceMp4Sha256 = null`
- `actualPublishedSourceVerification = HOLD`
- `C19-A1 Review Cycle / Archive / Real E2E Attestation = HOLD`
- `C19-A2 Human Decision / Next Round / Attestation = HOLD`

不能将本文件的 HASH 填入“已上传源文件 SHA”的字段，也不能将“是的”理解成对优化 A/B 方案、下一轮公开发布、Runtime 写入或 Production 晋级的额外授权。

## 可复用后续证据与检查点

本文件提供 C19-A1 人工视觉版本归属的正式引用，后续不必反复询问字幕版本。待进一步取得上传前导出成片的原件及与本候选的同一性证明，才能把具体 `publishedSourceBinding` 送入 Human Gate。人工复盘优化建议仍在 `C19_A1_A2_HUMAN_REVIEW_AND_NEXT_ROUND_V1_READY.md`，未被批准。

检查点：
`C19_A1_HUMAN_PUBLISHED_VISUAL_IDENTITY_CONFIRMED__ORIGINAL_UPLOAD_BYTE_PROOF_HOLD__HUMAN_REVIEW_HOLD`。
