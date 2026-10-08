# C19-A1｜A0 首帧字幕候选最终视觉 QA V1 CURRENT

日期：2026-10-08
作者决策：A0（首帧字幕）**方向已获 HUMAN 选择**，不等于最终视频验收或对外发布。
素材：`C19_A1_A0_FIRST_FRAME_CAPTION_PREVIEW_ONLY.mp4`
对照源：`kf01_tonight_v01.mp4`
判定：**TECHNICAL PASS / VISUAL QA HOLD / PUBLICATION NOT AUTHORIZED**

## 本轮实测结果

- 源文件：4011967 bytes，SHA-256 `d1184df7d7cdd6cbd23ebd0d100f29d913fbcb16097d568a2cc8a662fabc3890`。
- A0 文件：1207583 bytes，SHA-256 `57c608d29912effe2a761dab8c22ee092c959c4502017f67369a2c32b3fd9ab4`。
- 两者均 `12.000s / 1080×1920 / 25fps / 300 frames / H264 + AAC`。
- 两者 AAC bitstream SHA-256 一致：`17dc02a1d10455e8b43dc49486e87a921341fc12bee9b3efbc2264c84f6704a9`。
- 完整文件解码检查退出码 0，技术层面 PASS。
- 直接比对 0.25s、0.8s、2.5s 帧：A0 在首帧显示新字幕，满足作者所选首帧方向；**在约 0.8s 时 A0 新字幕淡出与原片字幕淡入重叠，观察到重影/灰字叠加**，不满足正式视觉输出标准。

## 根因和修复范围

当前 A0 是把首帧字幕叠加在原视频上，而原视频约 0.75–1.0s 已开始叠入相同字句；简单使用两层同时淡入淡出导致局部重影。

仅对 **0–1.3s 文字图层时序和遮罩/合成关系**做非破坏性修复，确保画面上任何时刻只有一层有效字幕。优先选择“首帧显示同一条文字，平滑接到原片字幕”，不得用大面积模糊或遮蔽破坏人物/海面画质。原 Identity / Look / Scene、音乐、其他 1.3–12s 素材均不得改。修复成片输出为新的 V0.2 CANDIDATE，保留 V0.1 不覆盖。

## Gate

- 创意方向：HUMAN SELECTED = A0
- 技术 QA：PASS
- 正式视觉 QA：HOLD（字幕重影）
- 正式发行源 SHA：HOLD（本地原视频与已上传的原始字节对应未核验）
- 下轮真实外发及 C19-A2 结果：HOLD（未授权、未发布）
- M32.5 Release：HOLD

下一操作：**只修复上述重影，并重新抽样 0.1 / 0.5 / 0.8 / 1.0 / 1.3 / 2.5s**。若视觉 QA PASS，交作者评审；不得自动对外发布。


## V0.2 最小精修结果（新增候选，不覆盖 V0.1）

- 原片真实字幕 0.75–1.0 秒已自然淡入；将新增首帧字幕限制在 `0–0.68s`，`0.44–0.68s` 淡出；此后仅保留原片字幕，不再与其叠印。
- 非破坏性输出：`C19_A1_A0_FIRST_FRAME_CAPTION_V0.2_CANDIDATE.mp4`，临时工作路径 `/mnt/data/C19_A1_A0_FIRST_FRAME_CAPTION_V0.2_CANDIDATE.mp4`。
- 实际编码：12s、1080×1920、300 帧、25fps；完整文件大小 `15,450,256` 字节，SHA-256 `d8e6c4d20d4c26391152879b0c365490f2fb75086ad81f81857a0d1a22270726`。
- 原片与 V0.2 AAC 编码流 SHA-256 均为 `17dc02a1d10455e8b43dc49486e87a921341fc12bee9b3efbc2264c84f6704a9`，音乐未更改。
- 样张 `A0_V02_QA_CONTACT.png` 对比 0.24 / 0.52 / 0.8 / 1.2 秒：先前 V0.1 的同字叠加重影已消除；但 0.68s 后到原片字幕清晰显示前仍有淡出与淡入接力效果，且字体尺寸/摆位视觉不完全统一，**故按发布级精度继续保留 VISUAL FINAL HOLD，交作者观看决定是否进一步优化**。
- V0.2 为新的私人候选，不写回源文件、不上传到小红书、不修改唯一 CURRENT Master。
- Gate：TECH PASS / DOUBLE-OVERLAY FIX PASS / EDITORIAL REVIEW PENDING / PRODUCTION RELEASE HOLD。
