# EVOLUTION-005 — Design Stage Checklist Optimization

## 1. 背景

在 Project、Product 阶段完成结构化 Checklist / Validation / Gate 定义后，继续将同一标准迁移到 Design 阶段。

## 2. 优化原则

不新增独立流程体系。Design 复用统一 Checklist Item Schema：

`ID / Name / Required / Validation / Evidence / Blocker / Status / Owner / Checked By / Checked At`

## 3. 核心判断

Design 的 Input 必须来自 Product 的明确 Output Contract；Design 的 Output 必须能够被 Engineering 和 QA 消费。

因此本阶段重点不是单纯检查“有没有 Figma”，而是检查：

- 需求输入是否完整
- 信息架构是否完整
- 核心流程与交互是否覆盖
- 异常/状态是否覆盖
- 视觉细节是否可实现
- 组件/资产是否可追溯
- Handoff 是否足够支持工程实现
- 未决问题和 Warning 是否显式传递

## 4. 本次产出

`ai/knowledge-base/v1.0/workflows/DESIGN_STAGE_CHECKLIST_V1.0.md`

## 5. Gate

Design Ready 继续采用统一三态：

- Pass
- Pass with Warning
- Blocked

## 6. 项目配置

Design Checklist 可以在项目初始化时按项目条件生成实例；Conditional 项可根据项目终端、范围等条件启用或标记 N/A。项目级修改需要记录 Checklist Change Log。

## 7. 下一步

继续进入 Engineering 阶段，并验证 Design Output 是否足够形成稳定的 Engineering Input Contract。
