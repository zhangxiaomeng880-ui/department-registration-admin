# EVOLUTION-001｜AI Native 项目完整演进过程

> 状态：V1.0 已确认  
> 目的：记录本项目如何从实际项目问题逐步演进为完整的 AI Native 项目运行机制。  
> 说明：本文记录的是可审计的项目思考、问题、证据、方案演进、决策、执行、产出与验证过程，不记录模型隐藏的 Chain-of-Thought。

## 0. Evolution 标准记录结构

从本版开始，每个演进阶段统一记录：

**问题/背景 → 输入/证据 → 分析/判断 → 决策 → 执行 → 产出 → 产出地址 → 验证 → 结果 → 后续影响**

其中“产出”必须是实际生成或更新的项目资产，而不是只描述“做了什么”。

### 产出类型

- Product：PRD、业务模型、需求分析、决策
- Design：Figma、视觉稿、设计规范
- Engineering：代码、技术方案、架构
- QA：测试用例、测试报告、质量结果
- Analytics：数据分析、指标、诊断结果
- Knowledge：知识库、规则、经验
- Workflow：工作流、自动化流程
- Agent：Agent、Prompt、能力配置
- Project：项目结构、Project Hub、目录资产
- Release：版本、发布记录、回滚记录
- Decision：关键决策记录

### 产出血缘

每个重要产出应能够追溯到：

**问题 → 输入 → 决策 → 执行 → 产出 → 验证 → 结果**

产出发生后，应登记资产路径、版本/Commit/Figma 等可定位信息，并与 Evolution ID、事项 ID 建立关联。

---

## 1. 为什么需要记录演进过程

如果只保留最终 V1.0 规则，未来的成员或 AI 只能知道“现在是什么”，却不知道“为什么会变成这样”。

因此本项目保留三层知识：

- `AI_NATIVE_PROJECT_OS_V1.0.md`：当前应该怎么运行
- `decisions/`：某个关键节点为什么这样决定
- `project-evolution/`：整个体系如何一步一步演进到当前状态

同时，每个 Evolution 节点都保留对应产出及其地址，避免“过程有了、结果却找不到”。

---

## 2. 第一阶段：从 Git 项目资产开始

### 发现的问题

项目事项、文档、代码、设计和知识容易分散；如果没有统一的资产底座，后续 AI 很难稳定读取项目上下文。

### 输入/证据

现有项目已经使用 Git 管理代码及部分项目资产。

### 形成的判断

Git 应作为项目资产的事实底座，并通过目录与唯一 ID 建立资产关联。

### 执行

建立项目资产目录与 Project Hub 统一入口。

### 产出

- `ai/`：AI 与 Knowledge Base
- `product/`：Product
- `design/`：Design
- `engineering/`：Engineering
- `qa/`：QA
- `release/`：Release
- `analytics/`：Analytics
- `docs/`：文档与 Project Hub
- `plugin/`：插件相关资产

### 产出地址

Git 仓库：`zhangxiaomeng880-ui/city-service-admin`

目录说明：`ai/knowledge-base/v1.0/PROJECT_DIRECTORY_NOTE.md`

### 演进结果

形成 Project → Git Asset 的基本关系，并明确 Project Hub 负责统一入口，而不是重新建设一个独立项目管理平台。

---

## 3. 第二阶段：发现“目录结构”不等于“项目结构”

### 发现的问题

仅有 Git 文件夹只能回答“文件放在哪里”，不能回答“这个事项属于哪个项目、哪个模块、当前处于什么阶段”。

### 形成的判断

需要独立于 Git 文件夹的业务层级：

**项目 → 业务域/模块 → 事项 → 阶段 → 任务 → 执行记录 → 交付资产**。

### 执行

在 AI Native 项目机制中定义项目层级，并用唯一 ID 关联事项和资产。

### 产出

- 项目层级模型
- 事项与资产关联原则
- Project Hub 导航关系

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 演进结果

Git 负责资产存储，项目层级负责业务关系，两者通过唯一 ID 关联。

---

## 4. 第三阶段：从“做了什么”进入“怎么衡量”

### 发现的问题

如果只记录事项和文件，无法判断项目效率是否提升，也无法证明 AI Native 的价值。

### 补充能力

每个重要节点记录：负责人、参与人、AI 是否参与及参与内容、开始/结束时间、计划/实际耗时、实际工作耗时、等待耗时、自然周期、返工、变更、阻塞。

### 关键判断

必须区分自然周期与实际工作时间，否则无法正确比较效率。

### 产出

- 项目执行记录模型
- 时间口径：自然周期 / 工作耗时 / 等待耗时
- 效率与 ROI 的基础记录框架

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 后续影响

后续可以在相似复杂度事项之间比较 AI 与人工的实际效率，并识别等待、返工等非生产性耗时。

---

## 5. 第四阶段：从“项目完成”进入“知识沉淀”

### 发现的问题

项目结束后，如果经验只留在聊天记录或个人记忆里，下一个项目仍然需要从零开始。

### 形成的判断

V1.0 Knowledge Base 不只是文档仓库，而是项目持续运行的长期上下文。

### 执行

把项目规则、经验、失败案例、决策等纳入 Knowledge Base。

### 产出

- V1.0 核心知识库
- Knowledge Base 维护原则
- Current Knowledge / Decision / Evolution 分层机制

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 演进结果

项目执行 → 结果 → 经验 → Knowledge Base → 下一次项目复用。

同时沉淀成功经验、失败经验、已确认结论、已否决方案、Decision Log、Change Log。

---

## 6. 第五阶段：发现“复用”比单项目效率更有长期价值

### 发现的问题

单次项目变快，并不等于组织能力变强。

### 形成的判断

项目应持续产生可复用资产：Product 模板、Design 模式、业务规则、技术方案、QA 用例、Workflow、Agent、Prompt/规则。

### 产出

- 项目复用模型
- 可复用资产分类
- 复用效果记录要求

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 演进结果

项目 A 的经验能够进入项目 B/C/D，而不是每次从 0 → 1。

---

## 7. 第六阶段：发现项目必须持续感知外部和内部结果

### 已有驱动源

1. **竞品**：感知外部市场、竞品能力和行业变化
2. **数据**：感知真实用户行为、异常和问题
3. **KPI**：判断业务目标是否达成

### 新增待建设驱动源

4. **用户反馈**：当前没有正式入口，因此标记为待建设，不阻塞当前项目。

### 形成的判断

这些不是简单的数据模块，而是“持续迭代驱动源”。它们负责不断产生问题和机会，推动 Product 再次进入执行链路。

### 产出

- 持续迭代驱动层定义
- 竞品 / 数据 / KPI 三类已确认驱动源
- 用户反馈待建设项

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

---

## 8. 第七阶段：明确“自闭环”不是普通流程闭环

### 发现的问题

“发现问题 → 人工分析 → 人工执行 → 人工复盘”只能叫流程闭环，不是 AI Native 自闭环。

### 形成的定义

本项目中的自闭环特指：**发现 → 分析 → 决策建议 → 执行 → 验证 → 学习 → 再执行。**

目标是让 AI 逐步承担分析、执行、验证和学习，人只在必要的决策门介入。

### 产出

- AI Native 自闭环定义
- 自动化闭环基本链路

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

---

## 9. 第八阶段：补充 Trigger，让闭环真正能够自动启动

### 发现的问题

即使具备分析能力，如果没有明确的触发条件，AI 仍然需要人告诉它“什么时候开始做”。

### 形成的判断

每类信号都需要 Trigger：KPI 低于阈值、数据异常、竞品重大变化、用户反馈达到阈值（待建设）。

### 产出

- Trigger 定义
- 竞品 / 数据 / KPI / 用户反馈与 Trigger 的映射

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 演进结果

闭环从“人主动发起”向“事件自动触发”演进。

---

## 10. 第九阶段：补充 Human Gate

### 发现的问题

不是所有任务都适合完全自动执行。

### 形成的判断

根据风险划分：AI 自动执行；AI 生成方案 → 人工确认；AI 分析 → 人工决策；必须人工决策。核心业务规则、重大范围变化、正式发布等高风险节点保留人工决策门。

### 产出

- Human Gate 分级机制
- AI 自动化等级边界

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

---

## 11. 第十阶段：补充自动验证、回滚和重试

### 发现的问题

如果 AI 执行后没人验证，自动化只能把错误更快地放大。

### 形成的闭环

AI 执行 → 自动验证 → 保留 / 回滚 / 重试 / 重新分析。

### 产出

- 自动验证机制
- 回滚机制
- 重试机制
- 结果状态定义

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

---

## 12. 第十一阶段：发现“自动检测”必须可追溯

### 发现的问题

如果 AI 只输出“发现异常”“竞品发生变化”，未来无法判断它从哪里看到、依据什么判断，也无法复核。

### 形成的强制规则

所有自动检测、自动诊断、自动触发都必须记录 Source / Evidence：Detection ID、检测类型/时间/触发条件、来源类型、来源地址或 Git 路径、来源版本/数据时间范围、原始证据摘要、计算/判断方法、检测结果、置信度、关联事项、后续动作。

### 产出

- Detection Source / Evidence Schema
- 来源类型规范
- 自动检测可审计要求

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

### 演进结果

AI 自动化由“黑盒输出”变为“可审计、可复现、可追溯”。

---

## 13. 第十二阶段：补充 Context Readiness 与影响分析

### 发现的问题

AI 上下文不完整时容易自行猜测；一个局部变化也可能影响 Design、Code、QA、Workflow 和 Knowledge。

### 形成的判断

执行前必须检查上下文是否就绪；关键变化发生时需要识别上下游影响。典型关系：**REQ → DES → ENG → QA → REL**。

### 产出

- Context Readiness 检查机制
- 依赖关系模型
- 影响分析原则

### 产出地址

`ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`

---

## 14. 第十三阶段：从“当前规则”进一步形成“可进化知识”

### 发现的问题

如果知识库只保存最终答案，未来不知道历史条件，也无法判断旧决策是否已经过时。

### 形成的判断

需要同时保留 Current Knowledge、Decision Log、Project Evolution。

### 本阶段新增的关键规则：记录演进产出

每个 Evolution 节点必须保留产出，形成：

**问题 → 输入 → 思考/分析 → 决策 → 执行 → 产出 → 验证 → 结果 → 影响。**

### 产出

- Project Evolution 文档
- Evolution 节点标准结构
- Output / 产出分类
- 产出地址与资产血缘要求

### 产出地址

`ai/knowledge-base/v1.0/project-evolution/EVOLUTION-001-AI-NATIVE-PROJECT-FLOW.md`

### 演进结果

项目演进不再只有“思考过程”，而是形成可追溯的**思考 → 执行 → 产出 → 验证**完整链路。

---

## 15. 第十四阶段：形成完整 AI Native 项目运行机制

### 最终流程

```text
项目目标
  ↓
Context Readiness
  ↓
持续感知
  ├─ 竞品
  ├─ 数据
  ├─ KPI
  └─ 用户反馈（待建设）
  ↓
Trigger
  ↓
AI 分析
  ↓
Decision / Human Gate
  ↓
Product
  ↓
Design
  ↓
Engineering
  ↓
QA
  ↓
Release
  ↓
数据 / KPI / 结果验证
  ↓
保留 / 回滚 / 重试
  ↓
Knowledge Update
  ↓
能力与资产复用
  ↓
下一轮项目/迭代
  ↺
```

### 核心产出资产

- `ai/knowledge-base/v1.0/AI_NATIVE_PROJECT_OS_V1.0.md`：当前运行机制唯一事实来源
- `ai/knowledge-base/v1.0/PROJECT_DIRECTORY_NOTE.md`：目录与资产导航
- `ai/knowledge-base/v1.0/project-evolution/EVOLUTION-001-AI-NATIVE-PROJECT-FLOW.md`：完整演进与产出记录
- `ai/knowledge-base/v1.0/decisions/`：关键决策资产（持续建设）
- `docs/project-directory.html`：Project Hub

### 验证状态

当前机制进入真实项目运行阶段；V1.0 不以“文档完整”作为完成标准，而以真实运行、验证和复用结果作为后续迭代依据。

---

## 16. 当前阶段的原则

我们现在不继续为了“完整”而增加平台能力，而是开始用这套机制真实运行当前科室挂号项目。

真实运行过程中发现的问题、失败经验、自动化缺口、复用机会和新的驱动源，再反过来更新 V1.0。

因此：

> **先跑通 → 记录 → 产出 → 验证 → 发现问题 → 迭代机制 → 再复用。**

这本身就是 AI Native 项目的第一个真实自闭环实践。