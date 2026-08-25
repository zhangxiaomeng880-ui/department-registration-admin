# Stage Data Assets V2.2

本版本将各阶段实际产生的业务、交付、质量和执行统计纳入项目数据资产层。Product、Design、Planning、Engineering、Testing、Compliance、Release、Analytics、Maintenance 均必须记录实际产生的结构化数据并可派生指标。

核心原则：默认不人为补齐业务事实；只有项目明确配置 Auto-Fill Rule 时才允许自动补齐，并记录 rule_id、rule_version、原始输入和结果。所有指标必须具备数据血缘，可回溯至 Raw Record / Evidence / 外部数据源。

该数据层与 Project Execution Record、User & Responsibility、Model Usage Record、Handoff、Decision、Evidence、Log、Audit Record 共同构成 Project Data Layer，不新增 Agent。