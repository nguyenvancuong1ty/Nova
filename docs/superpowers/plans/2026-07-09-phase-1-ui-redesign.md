# Nova Phase 1 UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Phase 1 frontend into a Vietnamese-first studio dashboard that lets the user configure a run and monitor it from one screen.

**Architecture:** Keep the existing single-page React frontend and backend contracts, but split the current inline-style UI into focused presentation components plus one shared stylesheet. Preserve the existing polling and form state behavior while reorganizing the page into a three-zone dashboard with compact workspace tabs and a dedicated run-monitor column.

**Tech Stack:** React 19, TypeScript, Vite, Testing Library, Vitest, CSS

---

## File Map

- Modify: `src/frontend/main.tsx` to import a shared frontend stylesheet.
- Modify: `src/frontend/pages/ProductionPage.tsx` to compose the new dashboard shell and derive header metrics from run state.
- Modify: `src/frontend/components/ProductionForm.tsx` to become the left workspace panel with Vietnamese tabs and compact core fields.
- Modify: `src/frontend/components/CharacterForm.tsx` to match the new panel styling and Vietnamese labels.
- Modify: `src/frontend/components/ProgressPanel.tsx` to become the live run monitor card.
- Modify: `src/frontend/components/LogPanel.tsx` to become the live log card.
- Create: `src/frontend/components/StudioHeader.tsx` for the top identity and current-run summary band.
- Create: `src/frontend/components/MetricStrip.tsx` for the four summary cards below the header.
- Create: `src/frontend/components/OutputPanel.tsx` for the active output panel and quick actions.
- Create: `src/frontend/components/WorkspaceTabs.tsx` for the Vietnamese tab selector used by the workspace panel.
- Create: `src/frontend/styles.css` for the Inter-based dashboard visual system.
- Modify: `tests/frontend/App.test.tsx` to assert Vietnamese-first dashboard copy and primary actions.

### Task 1: Lock the new dashboard shell with a failing frontend test

**Files:**

- Modify: `tests/frontend/App.test.tsx`
- Read: `src/frontend/App.tsx`
- Read: `src/frontend/pages/ProductionPage.tsx`

- [ ] **Step 1: Replace the old app-shell assertion with a dashboard-oriented failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/frontend/App";

describe("App", () => {
  it("renders the Vietnamese studio dashboard shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /bàn điều khiển sản xuất tiểu thuyết sang gói video/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bắt đầu sản xuất/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/thiết lập cốt lõi/i)).toBeInTheDocument();
    expect(screen.getByText(/chưa có run nào được bắt đầu/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: FAIL because the current UI still renders English copy like `Nova Phase 1`, `Novel Production Setup`, and `No production run started.`

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/frontend/App.test.tsx
git commit -m "test: lock nova studio dashboard shell"
```

### Task 2: Add the new page shell, shared stylesheet, and summary components

**Files:**

- Modify: `src/frontend/main.tsx`
- Modify: `src/frontend/pages/ProductionPage.tsx`
- Create: `src/frontend/components/StudioHeader.tsx`
- Create: `src/frontend/components/MetricStrip.tsx`
- Create: `src/frontend/styles.css`
- Test: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Import the shared stylesheet from the frontend entrypoint**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: Add the top header component**

```tsx
import type { RunState } from "../../types";

interface StudioHeaderProps {
  status: RunState | null;
}

export function StudioHeader({ status }: StudioHeaderProps) {
  return (
    <section className="studio-hero">
      <div className="studio-hero__copy">
        <p className="eyebrow">Nova Studio / Phase 1 Console</p>
        <h1>Ban dieu khien san xuat tieu thuyet sang goi video</h1>
        <p className="studio-hero__description">
          Khong gian lam viec thong nhat cho cau hinh du an, theo doi run theo
          thoi gian thuc, va mo nhanh cac artifact dau ra.
        </p>
      </div>
      <div className="studio-hero__summary">
        <article className="glass-card">
          <span className="glass-card__label">Run hien tai</span>
          <strong>{status?.runId ?? "Chua co run nao"}</strong>
        </article>
        <article className="glass-card">
          <span className="glass-card__label">Trang thai</span>
          <strong>{status?.status ?? "San sang khoi tao"}</strong>
        </article>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add the metric strip component**

```tsx
import type { RunState } from "../../types";

interface MetricStripProps {
  status: RunState | null;
  characterCount: number;
}

export function MetricStrip({ status, characterCount }: MetricStripProps) {
  const completedSteps = status?.logs.length ?? 0;

  return (
    <section className="metric-strip" aria-label="Tong quan du an">
      <article className="metric-card">
        <span className="metric-card__label">Tien do</span>
        <strong>{status ? `${status.progressPercent}%` : "0%"}</strong>
        <p>{completedSteps} moc log da ghi</p>
      </article>
      <article className="metric-card">
        <span className="metric-card__label">Nhan vat</span>
        <strong>{characterCount}</strong>
        <p>Ho so dang co trong cau hinh</p>
      </article>
      <article className="metric-card">
        <span className="metric-card__label">Asset</span>
        <strong>{status?.currentChapter ?? 0}</strong>
        <p>Chapter dang xu ly hoac da xong</p>
      </article>
      <article className="metric-card">
        <span className="metric-card__label">Ngon ngu UI</span>
        <strong>Tieng Viet</strong>
        <p>Toi uu cho van hanh noi bo</p>
      </article>
    </section>
  );
}
```

- [ ] **Step 4: Recompose `ProductionPage` around the new dashboard shell**

```tsx
import { useEffect, useState } from "react";
import type { RunState } from "../../types";
import { LogPanel } from "../components/LogPanel";
import { MetricStrip } from "../components/MetricStrip";
import { OutputPanel } from "../components/OutputPanel";
import { ProductionForm } from "../components/ProductionForm";
import { ProgressPanel } from "../components/ProgressPanel";
import { StudioHeader } from "../components/StudioHeader";

export function ProductionPage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<RunState | null>(null);
  const [characterCount, setCharacterCount] = useState(2);

  useEffect(() => {
    if (!runId) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      const response = await fetch(`/api/production/status/${runId}`);
      if (!response.ok || cancelled) {
        return;
      }
      const payload = (await response.json()) as RunState;
      setStatus(payload);
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [runId]);

  return (
    <main className="studio-page">
      <StudioHeader status={status} />
      <MetricStrip status={status} characterCount={characterCount} />
      <section className="studio-workspace">
        <ProductionForm
          onStarted={setRunId}
          onCharacterCountChange={setCharacterCount}
        />
        <aside className="studio-sidebar">
          <ProgressPanel status={status} />
          <LogPanel logs={status?.logs ?? []} />
          <OutputPanel outputPath={status?.outputPath ?? ""} />
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add the shared stylesheet that defines the dashboard system**

```css
:root {
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  color: #171412;
  background:
    radial-gradient(circle at top left, rgba(234, 168, 111, 0.22), transparent 28%),
    radial-gradient(circle at top right, rgba(77, 43, 25, 0.18), transparent 26%),
    linear-gradient(180deg, #f7f1e8 0%, #efe6dc 100%);
}

body {
  margin: 0;
  min-width: 320px;
  color: #171412;
  background: transparent;
}

#root {
  min-height: 100vh;
}

.studio-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: grid;
  gap: 18px;
}

.studio-hero,
.metric-card,
.workspace-panel,
.status-card,
.log-card,
.output-card {
  border: 1px solid rgba(69, 50, 37, 0.14);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(58, 41, 28, 0.08);
}

.studio-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.studio-sidebar {
  display: grid;
  gap: 18px;
  align-content: start;
}

@media (max-width: 960px) {
  .metric-strip,
  .studio-workspace,
  .studio-hero {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run the frontend test to verify the shell passes**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: PASS with the new Vietnamese heading and empty-state copy rendered.

- [ ] **Step 7: Commit the shell and styling baseline**

```bash
git add src/frontend/main.tsx src/frontend/pages/ProductionPage.tsx src/frontend/components/StudioHeader.tsx src/frontend/components/MetricStrip.tsx src/frontend/styles.css tests/frontend/App.test.tsx
git commit -m "feat: add nova studio dashboard shell"
```

### Task 3: Rebuild the workspace panel as a compact Vietnamese tabbed form

**Files:**

- Modify: `src/frontend/components/ProductionForm.tsx`
- Modify: `src/frontend/components/CharacterForm.tsx`
- Create: `src/frontend/components/WorkspaceTabs.tsx`
- Modify: `src/frontend/styles.css`
- Test: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Extend the app test to assert workspace tabs**

```tsx
expect(screen.getByRole("tab", { name: /du an/i })).toBeInTheDocument();
expect(screen.getByRole("tab", { name: /cot truyen/i })).toBeInTheDocument();
expect(screen.getByRole("tab", { name: /nhan vat/i })).toBeInTheDocument();
expect(screen.getByRole("tab", { name: /video/i })).toBeInTheDocument();
```

- [ ] **Step 2: Run the frontend test to verify the new tab assertions fail**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: FAIL because the current form does not render any tabbed workspace.

- [ ] **Step 3: Add the workspace tab selector component**

```tsx
interface WorkspaceTabsProps {
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function WorkspaceTabs({
  tabs,
  activeTab,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label="Nhom cau hinh">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === activeTab}
          className={tab === activeTab ? "workspace-tab is-active" : "workspace-tab"}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `ProductionForm` as a compact workspace panel**

```tsx
interface ProductionFormProps {
  onStarted: (runId: string) => void;
  onCharacterCountChange: (count: number) => void;
}

const workspaceTabs = ["Du an", "Cot truyen", "Nhan vat", "Video"] as const;

export function ProductionForm({
  onStarted,
  onCharacterCountChange,
}: ProductionFormProps) {
  const [form, setForm] = useState<ProductionInput>(defaultInput);
  const [activeTab, setActiveTab] =
    useState<(typeof workspaceTabs)[number]>("Du an");
  const [outputPathHint, setOutputPathHint] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    onCharacterCountChange(form.characters.length);
  }, [form.characters.length, onCharacterCountChange]);

  return (
    <form className="workspace-panel" onSubmit={handleSubmit}>
      <div className="workspace-panel__header">
        <div>
          <p className="eyebrow">Cau hinh du an</p>
          <h2>Thiet lap cot loi</h2>
        </div>
        <WorkspaceTabs
          tabs={workspaceTabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as (typeof workspaceTabs)[number])}
        />
      </div>

      {activeTab === "Du an" ? (
        <section className="field-grid">
          <label className="field-card">
            <span>Ten du an</span>
            <input
              aria-label="Ten du an"
              value={form.project.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  project: { ...form.project, title: event.target.value },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>Nguoi tao</span>
            <input
              aria-label="Nguoi tao"
              value={form.project.creatorName ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  project: { ...form.project, creatorName: event.target.value },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>So chapter</span>
            <input
              aria-label="So chapter"
              type="number"
              value={form.chapterConfig.totalChapters}
              onChange={(event) =>
                setForm({
                  ...form,
                  chapterConfig: {
                    ...form.chapterConfig,
                    totalChapters: Number(event.target.value),
                  },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>Phong cach hinh anh</span>
            <input
              aria-label="Phong cach hinh anh"
              value={form.video.visualStyle}
              onChange={(event) =>
                setForm({
                  ...form,
                  video: { ...form.video, visualStyle: event.target.value },
                })
              }
            />
          </label>
        </section>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 5: Localize and restyle `CharacterForm` for the character workspace**

```tsx
export function CharacterForm({
  character,
  index,
  onChange,
}: CharacterFormProps) {
  return (
    <fieldset className="character-card">
      <legend>Nhan vat {index + 1}</legend>
      <label className="field-card">
        <span>Ten nhan vat</span>
        <input
          aria-label={`Ten nhan vat ${index + 1}`}
          value={character.name}
          onChange={(event) =>
            onChange({
              ...character,
              name: event.target.value,
              id: event.target.value || character.id,
            })
          }
        />
      </label>
    </fieldset>
  );
}
```

- [ ] **Step 6: Add the workspace-specific styles**

```css
.workspace-panel {
  background: rgba(255, 252, 247, 0.9);
  padding: 18px;
  display: grid;
  gap: 16px;
}

.workspace-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workspace-tab {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #f1e7db;
  color: #4b392c;
  font: inherit;
  font-weight: 600;
}

.workspace-tab.is-active {
  background: #1f1713;
  color: #fff8f0;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field-card {
  display: grid;
  gap: 8px;
  background: #fffaf3;
  border: 1px solid rgba(95, 70, 50, 0.14);
  border-radius: 14px;
  padding: 12px 14px;
}
```

- [ ] **Step 7: Run the frontend test to verify the tabbed workspace passes**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: PASS with the tablist and Vietnamese labels rendered.

- [ ] **Step 8: Commit the workspace refactor**

```bash
git add src/frontend/components/ProductionForm.tsx src/frontend/components/CharacterForm.tsx src/frontend/components/WorkspaceTabs.tsx src/frontend/styles.css tests/frontend/App.test.tsx
git commit -m "feat: rebuild production workspace panel"
```

### Task 4: Redesign the run-monitor column and output card

**Files:**

- Modify: `src/frontend/components/ProgressPanel.tsx`
- Modify: `src/frontend/components/LogPanel.tsx`
- Create: `src/frontend/components/OutputPanel.tsx`
- Modify: `src/frontend/styles.css`
- Test: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Extend the app test to assert the new empty-state monitoring copy**

```tsx
expect(screen.getByText(/run monitor/i)).toBeInTheDocument();
expect(screen.getByText(/log truc tiep/i)).toBeInTheDocument();
expect(screen.getByText(/dau ra hien tai/i)).toBeInTheDocument();
expect(screen.getByText(/chua co run nao duoc bat dau/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run the frontend test to verify the monitoring assertions fail**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: FAIL because the current monitor panels still use old English titles and do not render an output card.

- [ ] **Step 3: Rewrite `ProgressPanel` as the run monitor card**

```tsx
import type { RunState } from "../../types";

interface ProgressPanelProps {
  status: RunState | null;
}

export function ProgressPanel({ status }: ProgressPanelProps) {
  return (
    <section className="status-card">
      <p className="eyebrow">Run monitor</p>
      <h2>{status ? "Dang xu ly" : "Chua co run nao duoc bat dau"}</h2>
      {status ? (
        <>
          <p>Buoc hien tai: {status.currentStep ?? "-"}</p>
          <p>
            Chapter: {status.currentChapter ?? 0} / {status.totalChapters}
          </p>
          <div className="progress-track" aria-label="Thanh tien do">
            <div
              className="progress-track__bar"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
          <p>{status.progressPercent}% hoan tat</p>
        </>
      ) : (
        <p>Khoi tao mot cau hinh o cot trai de bat dau run moi.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Rewrite `LogPanel` as the live log card**

```tsx
interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="log-card">
      <p className="eyebrow">Log truc tiep</p>
      <h2>Nhat ky xu ly</h2>
      <div className="log-card__body">
        {logs.length > 0 ? (
          logs.slice(-12).map((log) => (
            <p key={log} className="log-line">
              {log}
            </p>
          ))
        ) : (
          <p>Chua co log nao duoc ghi.</p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add the output card component**

```tsx
interface OutputPanelProps {
  outputPath: string;
}

export function OutputPanel({ outputPath }: OutputPanelProps) {
  return (
    <section className="output-card">
      <p className="eyebrow">Dau ra hien tai</p>
      <h2>Artifact chinh</h2>
      <p>{outputPath || "Chua co duong dan output."}</p>
      <div className="output-card__actions">
        <button type="button">Mo thu muc output</button>
        <button type="button">Sao chep duong dan</button>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add the monitoring and output styles**

```css
.status-card,
.log-card,
.output-card {
  padding: 18px;
  background: rgba(255, 252, 247, 0.9);
}

.progress-track {
  height: 12px;
  border-radius: 999px;
  background: #ead9c8;
  overflow: hidden;
}

.progress-track__bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8c4d28, #efb27c);
}

.log-card__body {
  max-height: 240px;
  overflow: auto;
}

.output-card {
  background: linear-gradient(180deg, #221914, #2c2019);
  color: #fff8f0;
}
```

- [ ] **Step 7: Run the frontend test to verify the monitoring column passes**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: PASS with all right-column sections rendered in Vietnamese.

- [ ] **Step 8: Commit the run-monitor column refactor**

```bash
git add src/frontend/components/ProgressPanel.tsx src/frontend/components/LogPanel.tsx src/frontend/components/OutputPanel.tsx src/frontend/styles.css tests/frontend/App.test.tsx
git commit -m "feat: redesign run monitor column"
```

### Task 5: Fill out the remaining workspace tabs and run final verification

**Files:**

- Modify: `src/frontend/components/ProductionForm.tsx`
- Modify: `src/frontend/components/CharacterForm.tsx`
- Modify: `src/frontend/styles.css`
- Modify: `README.md`
- Test: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Expand `ProductionForm` so every tab exposes meaningful Phase 1 inputs**

```tsx
{activeTab === "Cot truyen" ? (
  <section className="stack-fields">
    <label className="field-card">
      <span>Tien de chinh</span>
      <textarea
        aria-label="Tien de chinh"
        value={form.story.mainPremise}
        onChange={(event) =>
          setForm({
            ...form,
            story: { ...form.story, mainPremise: event.target.value },
          })
        }
      />
    </label>
    <label className="field-card">
      <span>Xung dot chinh</span>
      <textarea
        aria-label="Xung dot chinh"
        value={form.story.mainConflict}
        onChange={(event) =>
          setForm({
            ...form,
            story: { ...form.story, mainConflict: event.target.value },
          })
        }
      />
    </label>
  </section>
) : null}
```

- [ ] **Step 2: Add character and video tab bodies that reuse the existing data shape**

```tsx
{activeTab === "Nhan vat" ? (
  <section className="stack-fields">
    {form.characters.map((character, index) => (
      <CharacterForm
        key={`${character.id}-${index}`}
        character={character}
        index={index}
        onChange={(nextCharacter) =>
          setForm({
            ...form,
            characters: form.characters.map((item, itemIndex) =>
              itemIndex === index ? nextCharacter : item,
            ),
          })
        }
      />
    ))}
    <button
      type="button"
      className="secondary-action"
      onClick={() =>
        setForm({
          ...form,
          characters: [
            ...form.characters,
            {
              id: `character-${form.characters.length + 1}`,
              name: "",
              role: "supporting",
              visualDescription: "",
              personality: [],
              relationships: [],
            },
          ],
        })
      }
    >
      Them nhan vat
    </button>
  </section>
) : null}
```

- [ ] **Step 3: Surface form feedback and actions in Vietnamese**

```tsx
      <div className="workspace-actions">
        <button type="submit" className="primary-action">
          Bat dau san xuat
        </button>
        <button type="button" className="secondary-action" onClick={() => setForm(defaultInput)}>
          Khoi phuc mau
        </button>
        <button type="button" className="secondary-action">
          Mo thu muc output
        </button>
      </div>

      {error ? <p className="feedback error">{error}</p> : null}
      {outputPathHint ? (
        <p className="feedback hint">Duong dan output: {outputPathHint}</p>
      ) : null}
```

- [ ] **Step 4: Update the README to describe the Vietnamese dashboard UI**

```md
## Running The Local UI

The local UI is a single-screen dashboard with:

- A top project summary band
- A left workspace panel for project, story, character, and video setup
- A right monitoring column for run status, logs, and output paths
```

- [ ] **Step 5: Run targeted frontend and smoke tests**

Run: `npm run test -- tests/frontend/App.test.tsx tests/smoke/app.test.ts`
Expected: PASS

- [ ] **Step 6: Run the full test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 8: Commit the finished UI redesign**

```bash
git add src/frontend/components/ProductionForm.tsx src/frontend/components/CharacterForm.tsx src/frontend/styles.css README.md tests/frontend/App.test.tsx
git commit -m "feat: finish nova phase 1 ui redesign"
```

## Self-Review

- Spec coverage: the plan covers the three-zone layout, Vietnamese-first copy, Inter-based shared styling, compact workspace tabs, run-monitor column, output card, and README verification updates.
- Placeholder scan: no `TODO`, `TBD`, or deferred implementation notes remain in tasks.
- Type consistency: `ProductionForm` now owns `onCharacterCountChange`, `OutputPanel` accepts `outputPath`, and `ProductionPage` composes those exact interfaces through the full plan.
