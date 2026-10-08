# C19-A1 · 已发布视频视觉身份人工确认｜CURRENT V1.0

- 核验日期：2026-10-08
- 人工确认记录时间（UTC）：2026-10-08T12:53:12.291Z
- 证据类型：HUMAN_VISUAL_IDENTITY_CONFIRMATION（本对话中的作者本人回答）
- 对象：《你好，那年夏天》小红书已发布视频，公开标题「昨天，我又梦到你了」。
- 询问范围：「你实际发布到小红书的，是下面那组带『昨天，我又梦到你了。』字幕的画面吗？」
- 作者回答：**「是的」**。

## 可确定的事实

**PASS / HUMAN CONFIRMED**：公开作品使用的画面，对应前轮视觉对照中“包含『昨天，我又梦到你了。』字幕”的那一组。此前将无字幕母画面与 11s 无剧透前奏直接绑定为已发布片段的做法，不适用于这条已发表的作品。

- 最匹配的本地文件候选：`kf01_tonight_v01.mp4`。
- 原样读取的本地 Library 文件 ID：`file_0000000090a882308460974cdd972ffc`。
- 已计算的**本地候选文件** SHA-256：`d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`。
- 本地候选文件：12s、1080×1920、H.264 + AAC、带片中文字。
- Human visual identity：`CONFIRMED`。
- 关联证据：`C19_A1_MP4_SOURCE_CANDIDATES_V1_CURRENT.json` 和 `C19_A1_XIAOHONGSHU_PUBLICATION_RECORD_2026-10-08_CURRENT.md`。

## 不在本次批准范围内

**HOLD / NOT PROVEN**：作者确认的是“发布使用的是那组带字幕画面”，**不是**“上传时使用的 MP4 原始字节必定和这个本地候选文件的 SHA-256 完全一致”。平台可能重新编码；未取得上传端原文件清单、项目导出记录或完整上传原始文件映射证据。因此正式 `exactSourceMp4Sha256` 仍为 `null`，`publishedSourceBinding.humanConfirmedUploadSource` 不得设置为 `true`，正式 Master Archive 不能借此直接 PASS。

本次也**不表示**作者已经批准 Human Creative Review、AIGC 下一轮方案 A/B、新视频发布或 Production 晋级。上述 Gate 均独立保留。

## 生效后的检查点

`C19_A1_PUBLISHED_VISUAL_IDENTITY_HUMAN_CONFIRMED__EXACT_UPLOAD_SOURCE_HASH_HOLD__HUMAN_REVIEW_PENDING__A2_NEXT_ROUND_HOLD`

允许：更新只读证据、修正人物/镜头身份关联、继续收集真实发布与归档证明。
禁止：覆盖/删除已归档资产、重发视频、伪造源字节一致性、创建已批准的 Human attestation。
