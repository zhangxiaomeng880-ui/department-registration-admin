# C19-A2｜本地首屏镜头尺度试验 V0.1｜READY / NOT APPROVED

核验日期：2026-10-08
作品：《你好，那年夏天》· 小红书《昨天，我又梦到你了》
状态：PRIVATE_LOCAL_CANDIDATE / TECHNICAL_QA_PASS / HUMAN_CREATIVE_REVIEW_PENDING / NEVER PUBLISHED

## 源视频、真实依据

- 唯一源素材候选：kf01_tonight_v01.mp4；Library file ID：file_0000000090a882308460974cdd972ffc。
- 源文件 SHA-256：d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890（实际读取的 Library MP4；字节未证实为平台上传原文件）。
- 作者已确认已发表片段使用本文件的“带字幕视觉版本”，但并未确认上传时精确文件字节。
- 首屏分帧新发现：0.3 秒无字幕，1.0 秒已开始淡入，1.5 秒清晰可读；早前“约 2 秒才出现”的假设不准确，已纠正。
- 首轮平台数据：曝光 202、观看 88、2 秒退出 42.4%、5 秒完成 25%、平均观看 3.7 秒、全片完播 11.7%；这些数据不能建立单变量因果结论。

## 私有试验变体

- 输出：C19_A1_KF01_OPENING_REVEAL_V0.1_CANDIDATE.mp4，位于本轮临时工作容器 /mnt/data/，未上传 GitHub/Library、未设为 CURRENT、未发布。
- 唯一创意变量：开头约 1.8 秒，画面从数字轻微近景 (zoom=1.16) 平滑还原至原构图。
- 保留人物 Identity / Look、夜景地点、字幕内容和淡入时序、12 秒视频总时长与原始音轨。
- 技术规格：12.000 秒，1080×1920，25 fps / 300 帧，H.264；原 AAC 音轨直接 stream copy。
- 原与候选音轨编码数据 SHA-256 相同：17dc02a1d10455e8b43dc49486e87a921341fc12bee9b3efbc2264c84f6704a9。
- 新候选大小：2356440 bytes；SHA-256：ad2801f33838750dd7512edae400df285ed532d436a6b5c861b646b691ebd801。
- 第 2 秒后与原视频的 SSIM All ≈ 0.990185。转码会造成像素及整文件哈希不同，此指标不是创意效果或平台转化的证明。
- 四张画面抽样时间：0.15 秒 / 0.9 秒 / 1.8 秒 / 3 秒。当前仅技术 QA PASS，不得直接称为创意 QA PASS。

## 下一道 Gate

1. 作者决定是否接受这项“前 1.8 秒镜头近景还原”实验，或选择修改/不采用。这份候选不意味着已经做出 HUMAN Review 批准。
2. 上传源原始 MP4 的字节来源映射仍缺证明；本候选与原 Library 片源任何 SHA 均不得冒充小红书上传源确证。
3. 候选尚无外部结果；只有另行获得正式外发批准、完成真实发布、取得表现数据与人工复盘、执行结果回写，才可能满足 C19-A2。
4. M32.5 最终 Gate 继续 HOLD；生产晋级、角色受限 E2E、M32.4.4 正式证据与 Rollback 仍是独立门槛。

恢复检查点：
C19_A1_VISUAL_HUMAN_PASS__SOURCE_UPLOAD_HASH_HOLD__A2_PRIVATE_PREVIEW_READY__A2_HUMAN_CREATIVE_GATE__M32_5_HOLD
