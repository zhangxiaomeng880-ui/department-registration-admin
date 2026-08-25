# EVOLUTION-004 — Product Stage Checklist Optimization

## 1. 背景

在 Project 阶段完成 Input / Output 深度定义后，进一步确认：Stage Input / Output 不只是说明性文档，而应成为结构化检查目录、检查项和 Gate 的基础 Schema。

## 2. 原始问题

仅定义 Product Input / Output，仍无法让 AI 判断当前阶段是否真的具备进入条件，也无法统一处理缺失、风险、验证失败等状态。

## 3. 关键思考

阶段标准需要拆成三层：

1. Stage Schema：定义理论上应该有什么。
2. Checklist：针对当前项目检查实际有没有。
3. Validation / Gate：依据检查结果决定 Pass、Warning 或 Blocked。

因此 Input / Output Catalog 必须进一步结构化为可检查的 Checklist Item。

## 4. 状态模型

统一采用：

- Pass：满足规则
- Warning：存在风险/待确认/非阻断缺口
- Missing：必需项缺失
- Fail：已有内容但不符合规则
- Not Applicable：明确不适用且有依据

Warning 是独立状态，不等同于弱化版 Fail。

## 5. Gate 模型

- Pass：所有 blocker Required 项 Pass。
- Pass with Warning：无 blocker Missing/Fail，但存在非 blocker Warning。
- Blocked：存在 blocker Missing/Fail，或 blocker Warning。

## 6. 本次执行

针对 Product 建立结构化检查目录，覆盖：

- Input Catalog
- Process Checklist
- Output Catalog
- Check Result Schema
- Status Rules
- Product Ready Gate
- Downstream Contract
- Execution Metadata

## 7. 本次产出

`ai/knowledge-base/v1.0/workflows/PRODUCT_STAGE_CHECKLIST_V1.0.md`

该文件将 Product 阶段的标准定义转化为可以被自动检查的结构化项。

## 8. 验证

重点验证 Product Output 是否能够形成明确的 Design Input Contract，并确保 Acceptance Criteria、Business Rules、User Flow 等关键资产可以被后续阶段直接消费。

## 9. 下一步

继续优化 Design 阶段，并复用同一套 Checklist / Validation / Gate Schema；如果实际项目暴露新的状态或检查类型，记录为新的 Decision / Evolution，而不是隐式修改规则。
