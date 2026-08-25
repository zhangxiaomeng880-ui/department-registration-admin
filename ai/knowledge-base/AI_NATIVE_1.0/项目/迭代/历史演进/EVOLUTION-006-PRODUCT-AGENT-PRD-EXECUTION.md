# EVOLUTION-006 — Product Agent / PRD 实际执行

## 1. 触发

Project 阶段已完成，确认可以从“流程机制建设”切换到“实际项目执行”。本节点正式启动 Product / PRD Agent。

## 2. Agent 机制确认

Project Agent 与 Product Agent 采用轻量 Agent Prompt + Stage Schema + Project Checklist + 当前项目上下文的组合方式，避免每次读取整个 Knowledge Base。

## 3. Token 最小化原则

- 优先读取当前 Stage 必需资产。
- 使用 ID / 路径引用，不重复复制完整文档。
- 历史 Knowledge 按需加载。
- 已验证内容不重复生成。
- 只修复 Blocker，不重做已通过项。
- 输出采用结构化摘要，详细内容落 Git。

## 4. 本次项目执行

项目：科室挂号。

核心业务模型：城市 → 医院 → 院区 → 科室 → 医生 → 日期/号源 → 挂号。

本期明确：单院区医院可跳过院区；当前属于能力建设阶段，不预设具体提升指标；用户反馈入口属于待建设能力，不阻塞 V1.0。

## 5. 本次产出

- `ai/agents/product/PRODUCT_AGENT_PROMPT_V1.0.md`
- `product/prd/DEPARTMENT_REGISTRATION_PRD_V1.0.md`
- `product/prd/DEPARTMENT_REGISTRATION_PRODUCT_CHECKLIST_V1.0.md`
- `product/prd/PRODUCT_DECISION_LOG_V1.0.md`
- `product/prd/PRODUCT_EVIDENCE_REGISTRY_V1.0.md`

## 6. Gate 结果

Product Checklist 完成后：**Pass with Warning**。

唯一保留的非阻断 Warning：Engineering 前需要进一步确认数据接口与依赖细节。

## 7. 机制验证结论

本次首次验证了：

Project Output → Product Agent → PRD → Checklist → Evidence / Decision Log → Product Gate → Design Input

该链路可以作为后续 Design Agent、Engineering Agent 等阶段的执行模板。

## 8. 下一步

进入 Design Agent 前，应消费本次 Product Output；不要重复读取全部 Project / Knowledge 内容。Design 阶段需要携带 Product Warning，并在必要时通过 Evidence / Decision Log 回溯。
