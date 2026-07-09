# Nova Phase 1 UI Redesign

## Goal

Refactor the current Phase 1 frontend into a Vietnamese-first operational dashboard that is usable as a continuous working console, not just a raw form. The redesigned UI must support both tasks in one screen:

- Configure a new production run quickly
- Monitor an active run, logs, and outputs without changing context

The redesign is limited to the existing frontend surface for Phase 1. It does not change backend contracts, workflow semantics, or Phase 1 scope.

## Product Direction

The interface should balance two modes:

- Operational dashboard: clear status, dense enough to work from, fast to scan
- Studio feel: warmer visual identity, stronger hierarchy, and a more intentional creative-tool presentation

The visual language is based on:

- `Inter` as the application font
- Vietnamese UI copy by default
- Warm studio palette with high text/background contrast
- Rounded but restrained panels and controls
- A compact hero that provides context without stealing too much vertical space

## Layout

The main screen is a three-zone dashboard.

### 1. Hero and Metrics

A top band summarizes the current workspace state:

- App identity and short product statement
- Last or current run identifier
- Current run status
- Small metric cards for progress, character count, generated assets, and UI language

This area is presentational and informational. It should not become a large landing-page hero.

### 2. Workspace Panel

The left column is the project configuration workspace. It is the main authoring surface.

Behavior:

- Show only the most important fields directly on the main panel
- Group the rest into tabbed sections
- Keep the panel usable even when no run is active

Primary tabs:

- `Dự án`
- `Cốt truyện`
- `Nhân vật`
- `Video`

Main-panel fields should stay compact and high-value, such as:

- Project title
- Creator name
- Total chapters
- Visual style

Lower-frequency or longer-form fields should appear in expanded grouped sections within the active tab instead of flooding the main viewport.

Primary actions in this panel:

- `Bắt đầu sản xuất`
- `Khôi phục mẫu`
- `Mở thư mục output`

`View Logs` should not remain as a disconnected button because logs already have a dedicated live panel.

### 3. Run Column

The right column is a live monitoring surface.

It contains three stacked panels:

- `Run monitor`: status, current step, chapter progress, progress bar
- `Log trực tiếp`: recent workflow logs
- `Output hiện tại`: active output path and quick access actions

This column must remain useful before, during, and after a run:

- Before run: neutral empty states in Vietnamese
- During run: active progress and latest logs
- After run: final status and stable access to outputs

## Interaction Model

The screen is designed for continuous use in one place.

Primary flow:

1. User opens the app and immediately sees current run context.
2. User edits core setup fields in the workspace panel.
3. User starts production from the same panel.
4. Attention shifts naturally to the run column for monitoring.
5. User can prepare the next configuration or inspect output paths without leaving the screen.

This means the app should feel like a control console, not a multi-page wizard.

## Component Structure

The redesign should keep the existing feature surface but reorganize the frontend into clearer UI units.

Expected top-level structure:

- `ProductionPage`
  - `StudioHeader`
  - `MetricStrip`
  - `ProductionWorkspace`
  - `RunMonitorColumn`

Expected workspace subcomponents:

- `WorkspaceTabs`
- `ProjectCoreFields`
- `StorySettingsPanel`
- `CharacterWorkspace`
- `VideoSettingsPanel`
- `PrimaryActions`

Expected run-column subcomponents:

- `RunStatusCard`
- `LiveLogCard`
- `OutputCard`

Small shared presentation helpers are acceptable if they remove duplication, but the redesign should stay local to the frontend and not introduce a heavy design system.

## Content and Language

The app should default to Vietnamese labels, headings, helper text, empty states, and action text.

Examples:

- `Thiết lập cốt lõi`
- `Bảng điều khiển sản xuất`
- `Chưa có run nào được bắt đầu`
- `Đang xử lý`
- `Đầu ra hiện tại`

Technical identifiers such as run ids and filesystem paths remain unchanged.

## Visual Rules

- Use `Inter` across the app
- Prefer warm neutral backgrounds over flat white
- Keep text contrast strong enough for immediate readability
- Use darker surfaces only where contrast remains explicit
- Avoid low-contrast text on warm backgrounds
- Keep cards at moderate radius and avoid decorative nesting
- Use spacing and typography hierarchy to separate operational data from narrative setup

The style should feel closer to a serious creative operations tool than a generic admin panel.

## Implementation Boundaries

In scope:

- Frontend layout overhaul
- Vietnamese UI copy
- Better hierarchy, styling, spacing, and component split
- Better empty states and action placement

Out of scope:

- Backend API changes
- Workflow logic changes
- New persistence features
- Real file-opening integration beyond the current supported behavior
- New routes or multipage navigation

## Verification

Minimum verification for the redesign:

- Existing frontend tests updated where needed
- App-level render test still passes
- Full test suite passes
- `npm run build` passes
- Manual browser check on desktop layout

## Risks and Controls

Risk: visual redesign makes the form prettier but harder to operate.
Control: keep core fields and primary action visible without scrolling excessively.

Risk: Vietnamese copy becomes inconsistent across panels.
Control: convert the full screen together instead of mixing English and Vietnamese.

Risk: refactor spreads too far into unrelated code.
Control: keep changes scoped to `src/frontend/` and only touch tests that verify this surface.
