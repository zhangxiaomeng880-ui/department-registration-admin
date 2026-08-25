# Execution Identity Rules V1.0

## Primary Identity
All project execution records must link the responsible human/user identity to the user's **Gmail account** as the primary identity key.

**Current project primary account:** `zhangxiaomeng880@gmail.com`

Field:
- `Primary Account: zhangxiaomeng880@gmail.com`

This value is the project's explicitly confirmed human identity and must be used for project-level execution records unless the user explicitly changes it.

## Tool Identity
Tool-specific identities are secondary execution-environment metadata only:
- Figma Handle
- Figma Workspace / Team
- Seat / Permission
- File Key

They must not replace the Gmail identity as the person-level identity.

Current Figma execution environment:
- Figma Handle: `v-aila`
- Workspace: `v-aila's team`
- Seat: `View`

## Agent Identity
Agent execution is identified separately:
- Agent
- Stage
- Checklist Item ID
- Execution Time
- Result

## Example
```text
Primary Account: zhangxiaomeng880@gmail.com
Agent: Design Agent
Tool: Figma
Figma Handle: v-aila
Workspace: v-aila's team
Seat: View
File: 科室挂号 Design V1.0
```

## Privacy / Accuracy Rule
The project primary Gmail account above was explicitly provided by the user. Do not replace it with a Figma handle, workspace identity, or inferred address. If the user explicitly changes the project primary account, update this record and future execution metadata accordingly.
