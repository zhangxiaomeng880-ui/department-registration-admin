# V1.0 项目目录与资产归属

> 本文件是 V1.0 知识库的目录说明补充，不重复维护业务规则和 AI Native 运行机制。
> 核心规则、项目上下文和自动化机制以 `AI_NATIVE_PROJECT_OS_V1.0.md` 为唯一事实来源。

## Git 仓库

`zhangxiaomeng880-ui/city-service-admin`

## 主要目录

- `ai/`：AI、Knowledge Base、Rules、Workflows、Agents
- `product/`：Product 需求与研究
- `design/`：UX/UI
- `engineering/`：工程与架构
- `src/`：实际前端代码
- `qa/`：测试与质量保障
- `release/`：发布与版本
- `analytics/`：数据分析
- `docs/`：项目文档与 Project Hub
- `plugin/`：插件相关内容

## 项目导航

Project Hub 位于：`docs/project-directory.html`。

## Knowledge Base 结构

- `AI_NATIVE_PROJECT_OS_V1.0.md`：当前 AI Native 运行机制的唯一事实来源
- `project-evolution/`：完整演进过程；每个演进阶段同时记录问题、分析、决策、执行、**产出、产出地址、验证、结果和后续影响**
- `decisions/`：关键决策及其生命周期

### Evolution 产出要求

演进记录不是单纯的讨论记录。每个重要节点必须回答：

**问题/背景 → 输入/证据 → 分析/判断 → 决策 → 执行 → 产出 → 产出地址 → 验证 → 结果 → 后续影响**

产出应标注类型，例如 Product、Design、Engineering、QA、Analytics、Knowledge、Workflow、Agent、Project、Release、Decision，并尽可能提供 Git Path、Commit、Figma 或其他可定位地址。

重要产出应与 Evolution ID、事项 ID 建立关联，形成可追溯的产出血缘：

**问题 → 决策 → 执行 → 产出 → 验证 → 结果。**

## Project Context 资产归属

Project Context 属于项目生命周期级资产，不属于某一个 Stage 的临时文档。Project Agent 负责创建/刷新；Stage Agent 只消费和补充自己产生的新确认信息。

项目级上下文的优先读取顺序为：

**Project Context → Previous Stage Output → Knowledge Base → User Input**。

Git 中已经存在的项目上下文、阶段产出和知识资产应直接复用，不应要求用户重复提供。具体运行规则以 `AI_NATIVE_PROJECT_OS_V1.0.md`、`ai/rules/AI_RULES.md` 和 `ai/rules/STAGE_CONTRACT.md` 为准。

## 维护原则

1. 新增资产优先归入已有职责目录。
2. 不在根目录重复创建同类资产。
3. 目录职责调整时同步更新本文件。
4. 业务规则、项目决策、AI Native 运行机制不得在本文件重复维护，应回写核心源知识库。
5. Evolution 记录应同时登记实际产出及其地址，不能只记录思考过程。
6. Project Context 发生变更时，应同步记录来源、时间和影响范围。

## 核心源知识库

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`
