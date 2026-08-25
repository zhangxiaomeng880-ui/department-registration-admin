# Component Registry V1.0

## Purpose
Provide traceable, reusable component inputs for Design Agents. Components must resolve to an applicable official design system or an explicitly approved project component.

## Component Source Policy
- C端 / Mobile: use applicable official platform or Material components first.
- iOS-specific behavior: use Apple HIG guidance.
- B端 / Admin: use Ant Design components first.
- Do not create a project-specific replacement when an applicable standard component exists unless a Design Decision Record justifies it.

## Registry Structure
Each component record must contain:
- Component ID
- Name
- Platform / Surface
- Source Standard ID
- Official component URL
- Figma library / component reference when available
- Usage scope
- Variants / States
- Status
- Project override, if any

## Initial V1.0 Component Families

### C端 / Mobile
- Button
- Input / Search
- Tabs
- List / Cell
- Selector
- Dialog
- Bottom Sheet
- Toast / Feedback
- Loading
- Empty
- Error

### B端 / Admin
- Layout / Navigation
- Breadcrumb
- Page Header
- Form / Form Item
- Input / Select / DatePicker
- Search / Filter
- Table
- Pagination
- Tree / Tree Table
- Drawer
- Modal
- Tag / Status
- Upload
- Batch Operation
- Drag / Sort

## Registry Rule
The family list is a discovery index, not permission to invent visual variants. Before use, the Agent resolves the component from the applicable Figma library or official component documentation and records the reference in the project design artifact.

## Figma Requirement
A Design-ready component must be editable and reusable in Figma. Static screenshots or flattened images do not satisfy the component requirement.

## Status
- Active: approved for use
- Candidate: identified but not yet validated in the project Figma environment
- Deprecated: no longer recommended

V1.0 starts with official component families. Concrete Figma component references are resolved against the actual Design file/library during Design execution.
