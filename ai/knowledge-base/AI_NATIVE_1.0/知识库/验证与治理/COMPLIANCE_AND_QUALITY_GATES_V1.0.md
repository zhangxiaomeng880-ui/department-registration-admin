# Compliance / Testing / Audit Quality Gates V1.0

> 状态：V1.0 新增
> 定位：AI Native 项目的独立质量能力规范

## 1. 三种能力必须独立

### Testing AGENT

回答：**功能是否正确工作？**

负责功能、接口、异常、自动化、回归和缺陷验证。

### Compliance AGENT

回答：**是否符合已经确认的规则、约束和适用要求？**

负责业务规则、设计/技术约束、权限、数据、流程、环境、发布要求及其他适用合规规则。

### Audit AGENT

回答：**流程、结论、证据和 Gate 是否真实、完整、可追溯？**

负责独立审计整个流程和各质量结论，不属于 Testing 或 Compliance。

## 2. Gate 独立性

不得由一个 Gate 自动推导另一个 Gate：

- Testing PASS ≠ Compliance PASS
- Compliance PASS ≠ Audit PASS
- Testing PASS + Compliance PASS ≠ Audit PASS

最终 Release / Delivery Gate 必须基于所有适用 Gate 的实际结果。

## 3. Compliance Input

- Project Context
- Previous Stage Output
- Knowledge Base
- User Input（仅补充缺失 Required Input）
- 当前阶段实际产物
- 已确认规则与约束
- 适用环境、版本、分支和发布证据
- 已批准的例外/豁免

## 4. Compliance Execution

1. 读取上下文和适用规则。
2. 识别当前事项的 Applicable Rules。
3. 建立 Rule → Evidence → Result 映射。
4. 检查实际产物，不仅检查文档声明。
5. 输出 PASS / PARTIAL / FAIL / N/A。
6. 对异常记录 Finding、证据、影响和责任阶段。
7. 可自动修复的问题交回责任 Agent。
8. 涉及业务取舍、例外豁免或高风险事项时进入 Human Gate。
9. 修复后重新检查。

## 5. Compliance Output

每次检查至少输出：

- Input
- Input Verification
- Applicable Rules
- Compliance Checks
- Evidence
- Findings
- Exceptions / Waivers
- Compliance Gate
- Output Verification
- Handoff
- Status

## 6. Evidence Requirement

关键合规结论必须可追溯到：

- Rule ID
- 检查对象
- Evidence 来源
- Evidence 版本/时间
- 检查方法
- Result
- Finding
- 责任阶段

不得使用“已检查”“看起来符合”等无证据结论作为 PASS 依据。

## 7. User Prompt Policy

- PASS：自动告知，不打断用户。
- 可由责任 Agent 修复：自动回退并重新检查。
- 必须用户决策：只在业务取舍、例外豁免、高风险批准或规则冲突时提示用户。
- 用户提示必须说明问题、依据、影响以及需要确认的事项。
- 不得重复询问已有 Project Context。

## 8. Audit Relationship

Compliance 可以读取 Testing 结果，但不能直接继承 Testing PASS。

Audit 可以读取 Testing 和 Compliance 结果，但必须独立检查实际证据，并在结论与证据冲突时以证据为准。

Audit 发现 Compliance 问题时，应保持 Compliance Gate 的原始结论，并将问题返回责任 Agent 修复；Audit 不替责任 Agent 完成整改。

## 9. Release Blocking

存在阻塞性 Compliance FAIL 时，禁止执行依赖该 Gate 的正式发布/交付动作，除非存在明确、可追溯且经过授权的例外批准。
