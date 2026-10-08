# C19-A1｜A0 片头首帧字幕候选 · REVIEW_ONLY

核验日期：2026-10-08
对象：《你好，那年夏天》小红书已发短片《昨天，我梦到你了》（平台标题《昨天，我又梦到你了》）
Gate: **INTERNAL_REVIEW_CANDIDATE_ONLY / NO_HUMAN_CREATIVE_APPROVAL / NO_PUBLICATION**

## 已核验来源

- 作者已确认**实际已发布画面是带字版本**，证据 `C19_A1_HUMAN_VISUAL_IDENTITY_CONFIRMATION_V1_CURRENT.md`。但该确认并非原始上传 MP4 字节的一致性证明。
- Library 原件：`kf01_tonight_v01.mp4`，ID `file_0000000090a882308460974cdd972ffc`。
- 原件 12.000s / 1080×1920 / H.264 25fps / AAC。
- 原件完整 SHA-256：`d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`。
- 原件音频 AAC demux 哈希：`792081cce95b0dd592bf4476bd1ddc4e5be92c6900d3e000a481836282355a02`。
- MP4 的 format metadata 仅包含 `Lavf61.7.103` 等编码信息；没有平台上传回执/导出版本映射/原始上传文件 ID。Google Drive 对确切名字和发布标题的检索无匹配，不能把内容相似推定为字节级来源一致。

## 前 2 秒精读后的纠偏

逐帧比较 t=0、0.25、0.5、0.75、1、1.25、1.5、1.75s：原片前约 0.5s 无字幕，约 0.75s 文字开始淡入，约 1s 已可读。早前评审建议文本声称“标题约 2 秒起出现”不准确；只允许把本轮实验定义为“把字幕提前到首帧”而非“提前 2 秒”。

## 内部候选 A0（已在临时工作目录制作，未写入正式 Library）

- 预览文件：`C19_A1_A0_FIRST_FRAME_CAPTION_PREVIEW_ONLY.mp4`。
- 操作：原片 Shot 与人物 Identity/Look/Scene 全部复用；字幕 `昨天，我又梦到你了。` 从首帧显示，0.5s 后渐出，1.0s 停止新增图层以衔接原片字幕。没有更改故事、人物、镜头、对白，也没有重新生成角色。
- 预览输出：12.000s，大小 `1207583` 字节，SHA-256 `57c608d29912effe2a761dab8c22ee092c959c4502017f67369a2c32b3fd9ab4`。
- QA：视频可解码，0.25/0.8/2.5s 原片与 A0 抽帧核对；**AAC 码流原样 copy**，新片 AAC stream hash 与原片相同 `792081cce95b0dd592bf4476bd1ddc4e5be92c6900d3e000a481836282355a02`。
- 视频经过重新编码，不能视为与原片像素完全相同的 Master，也不保证正式导出画质一致。本地临时预览不属于外部发布证据。
- 预览永久归档：**未授权/未执行**；正式 `CURRENT` 母资产不更改。
- 后续可访问当前对话附件预览；工作目录是临时环境，不应作为持久资产地址。

## 本轮严格门禁

- **G-VISUAL:** HUMAN published visual ID PASS — 继续复用，不再重问。
- **G-BYTE:** actual uploaded source bytes ID HOLD — 候选 SHA 不是平台源 SHA。
- **G-REVIEW:** A0 是非发布技术样本；尚未得到作者对 A0 的创作批准。
- **G-A1:** HUMAN Review → FROZEN Archive → REAL E2E HOLD。
- **G-A2:** Next Round publish/performance/executed loop HOLD；**本次内部编辑不构成已执行的真实外部下一轮**。
- **G-M32.5:** 最终 Release Gate HOLD，Production untouched。

续跑锚点：
`M32_5_C19_A1_VISUAL_CONFIRMED__A0_FIRST_FRAME_INTERNAL_PREVIEW_QA_PASS__UPLOADED_MASTER_AND_REVIEW_HOLD__A2_EXTERNAL_LOOP_HOLD`。
