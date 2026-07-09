# Nova Excel Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a strict one-sheet Excel import flow that fills the full Nova production form from a single valid `.xlsx` row and fails atomically on any invalid input.

**Architecture:** Keep the feature frontend-only and split it into three focused units: a pure parser that maps worksheet rows into `ProductionInput`, a template generator that creates the approved workbook shape, and small UI wiring inside `ProductionForm`. Validation must flow through the existing `ProductionInputSchema` so import and manual entry use the same source of truth.

**Tech Stack:** React 19, TypeScript, Zod, Vitest, Testing Library, `xlsx`

---

## File Map

- Modify: `package.json` to add the Excel library dependency.
- Create: `src/frontend/importers/excelProductionInput.ts` for strict row parsing and schema validation.
- Create: `src/frontend/importers/excelTemplate.ts` for workbook template generation.
- Modify: `src/frontend/components/ProductionForm.tsx` to add `Import Excel` and `Tải file mẫu` actions plus strict error rendering.
- Modify: `src/frontend/styles.css` to style the new import actions and error box.
- Create: `tests/frontend/excelProductionInput.test.ts` for parser contract coverage.
- Modify: `tests/frontend/App.test.tsx` to assert the import/download actions and strict error affordance copy.
- Modify: `README.md` to describe the Excel import flow and template contract.

### Task 1: Add the Excel parser contract and failing tests

**Files:**

- Create: `tests/frontend/excelProductionInput.test.ts`
- Read: `src/schemas/productionInput.schema.ts`
- Read: `src/schemas/project.schema.ts`
- Read: `src/schemas/character.schema.ts`

- [ ] **Step 1: Write the failing parser tests**

```ts
import { describe, expect, it } from "vitest";
import { parseExcelProductionRows } from "../../src/frontend/importers/excelProductionInput";

const validRow = {
  project_title: "The Shadow Crown",
  creator_name: "Nova",
  language: "Vietnamese",
  format: "webnovel",
  genres: "dark fantasy|political intrigue",
  tone: "dramatic",
  target_audience: "young adult",
  main_premise: "A cursed crown awakens.",
  main_conflict: "Power demands sacrifice.",
  ending_direction: "Bittersweet victory",
  opening_situation: "A ruined chapel discovery",
  main_mystery: "Who forged the crown?",
  romance_angle: "Slow burn alliance",
  power_system_notes: "Relics bind memory",
  important_themes: "power|identity",
  world_setting: "Fallen kingdom",
  world_rules: "Relics demand a cost",
  magic_system: "Blood-bound artifacts",
  important_locations: "Ruined chapel|Royal crypt",
  important_organizations: "The Ash Court|Temple Guard",
  technology_level: "pre-industrial",
  social_structure: "noble houses",
  video_format: "short-episode",
  aspect_ratio: "16:9",
  visual_style: "cinematic dark fantasy anime-realism",
  camera_style: "slow cinematic camera movement",
  image_style_notes: "moonlit contrast",
  video_motion_style: "subtle atmospheric motion",
  voiceover_style: "dramatic narration",
  subtitle_style: "clean readable subtitles",
  total_chapters: 10,
  target_words_min: 1800,
  target_words_max: 2500,
  scenes_min: 8,
  scenes_max: 12,
  characters_json:
    '[{"id":"protagonist","name":"Arin","role":"protagonist","visualDescription":"Black hair, silver eyes","personality":["reserved"],"relationships":[]}]',
};

describe("parseExcelProductionRows", () => {
  it("parses one valid row into ProductionInput", () => {
    const result = parseExcelProductionRows([validRow]);
    expect(result.project.title).toBe("The Shadow Crown");
    expect(result.characters).toHaveLength(1);
    expect(result.world.importantLocations).toEqual([
      "Ruined chapel",
      "Royal crypt",
    ]);
  });

  it("fails when a required column is missing", () => {
    expect(() =>
      parseExcelProductionRows([
        { ...validRow, project_title: undefined },
      ]),
    ).toThrow(/project_title/i);
  });

  it("fails when characters_json is malformed", () => {
    expect(() =>
      parseExcelProductionRows([
        { ...validRow, characters_json: "[not-json]" },
      ]),
    ).toThrow(/characters_json/i);
  });

  it("fails when there is more than one data row", () => {
    expect(() => parseExcelProductionRows([validRow, validRow])).toThrow(
      /đúng 1 dòng dữ liệu/i,
    );
  });
});
```

- [ ] **Step 2: Run the parser test to verify it fails**

Run: `npm run test -- tests/frontend/excelProductionInput.test.ts`
Expected: FAIL because the importer module does not exist yet.

- [ ] **Step 3: Commit the failing parser test**

```bash
git add tests/frontend/excelProductionInput.test.ts
git commit -m "test: lock excel production import contract"
```

### Task 2: Implement the strict Excel row parser

**Files:**

- Create: `src/frontend/importers/excelProductionInput.ts`
- Test: `tests/frontend/excelProductionInput.test.ts`

- [ ] **Step 1: Implement strict helper parsing for arrays and required cells**

```ts
import { ProductionInputSchema } from "../../schemas/productionInput.schema";
import type { ProductionInput } from "../../types";

type ExcelRow = Record<string, unknown>;

function readRequiredString(row: ExcelRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Thiếu hoặc rỗng cột bắt buộc: ${key}`);
  }
  return value.trim();
}

function readRequiredNumber(row: ExcelRow, key: string): number {
  const value = row[key];
  const numberValue =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isFinite(numberValue)) {
    throw new Error(`Cột số không hợp lệ: ${key}`);
  }
  return numberValue;
}

function readPipeArray(row: ExcelRow, key: string): string[] {
  const raw = readRequiredString(row, key);
  const items = raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length === 0) {
    throw new Error(`Cột danh sách không hợp lệ: ${key}`);
  }
  return items;
}
```

- [ ] **Step 2: Implement the main row-to-schema mapper**

```ts
export function parseExcelProductionRows(rows: ExcelRow[]): ProductionInput {
  if (rows.length === 0) {
    throw new Error("File không có dòng dữ liệu.");
  }

  if (rows.length !== 1) {
    throw new Error("File phải có đúng 1 dòng dữ liệu.");
  }

  const row = rows[0];
  const charactersRaw = readRequiredString(row, "characters_json");
  let charactersParsed: unknown;

  try {
    charactersParsed = JSON.parse(charactersRaw);
  } catch {
    throw new Error("characters_json không phải JSON hợp lệ.");
  }

  return ProductionInputSchema.parse({
    project: {
      title: readRequiredString(row, "project_title"),
      creatorName: readRequiredString(row, "creator_name"),
      language: readRequiredString(row, "language"),
      format: readRequiredString(row, "format"),
      genres: readPipeArray(row, "genres"),
      tone: readRequiredString(row, "tone"),
      targetAudience: readRequiredString(row, "target_audience"),
    },
    story: {
      mainPremise: readRequiredString(row, "main_premise"),
      mainConflict: readRequiredString(row, "main_conflict"),
      endingDirection: readRequiredString(row, "ending_direction"),
      openingSituation: readRequiredString(row, "opening_situation"),
      mainMystery: readRequiredString(row, "main_mystery"),
      romanceAngle: readRequiredString(row, "romance_angle"),
      powerSystemNotes: readRequiredString(row, "power_system_notes"),
      importantThemes: readPipeArray(row, "important_themes"),
    },
    world: {
      worldSetting: readRequiredString(row, "world_setting"),
      worldRules: readRequiredString(row, "world_rules"),
      magicSystem: readRequiredString(row, "magic_system"),
      importantLocations: readPipeArray(row, "important_locations"),
      importantOrganizations: readPipeArray(row, "important_organizations"),
      technologyLevel: readRequiredString(row, "technology_level"),
      socialStructure: readRequiredString(row, "social_structure"),
    },
    characters: charactersParsed,
    video: {
      videoFormat: readRequiredString(row, "video_format"),
      aspectRatio: readRequiredString(row, "aspect_ratio"),
      visualStyle: readRequiredString(row, "visual_style"),
      cameraStyle: readRequiredString(row, "camera_style"),
      imageStyleNotes: readRequiredString(row, "image_style_notes"),
      videoMotionStyle: readRequiredString(row, "video_motion_style"),
      voiceoverStyle: readRequiredString(row, "voiceover_style"),
      subtitleStyle: readRequiredString(row, "subtitle_style"),
    },
    chapterConfig: {
      totalChapters: readRequiredNumber(row, "total_chapters"),
      targetWordsPerChapter: {
        min: readRequiredNumber(row, "target_words_min"),
        max: readRequiredNumber(row, "target_words_max"),
      },
      scenesPerChapter: {
        min: readRequiredNumber(row, "scenes_min"),
        max: readRequiredNumber(row, "scenes_max"),
      },
    },
  }) as ProductionInput;
}
```

- [ ] **Step 3: Run the parser test to verify it passes**

Run: `npm run test -- tests/frontend/excelProductionInput.test.ts`
Expected: PASS

- [ ] **Step 4: Commit the parser implementation**

```bash
git add src/frontend/importers/excelProductionInput.ts tests/frontend/excelProductionInput.test.ts
git commit -m "feat: add strict excel production parser"
```

### Task 3: Add workbook template generation

**Files:**

- Create: `src/frontend/importers/excelTemplate.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the Excel workbook dependency**

```json
{
  "dependencies": {
    "xlsx": "^0.18.5"
  }
}
```

- [ ] **Step 2: Install the dependency**

Run: `npm install`
Expected: `xlsx` is added to `package.json` and lockfile.

- [ ] **Step 3: Create the template workbook generator**

```ts
import * as XLSX from "xlsx";

const templateRow = {
  project_title: "The Shadow Crown",
  creator_name: "Nova",
  language: "Vietnamese",
  format: "webnovel",
  genres: "dark fantasy|political intrigue",
  tone: "dramatic",
  target_audience: "young adult",
  main_premise: "A cursed crown awakens.",
  main_conflict: "Power demands sacrifice.",
  ending_direction: "Bittersweet victory",
  opening_situation: "A ruined chapel discovery",
  main_mystery: "Who forged the crown?",
  romance_angle: "Slow burn alliance",
  power_system_notes: "Relics bind memory",
  important_themes: "power|identity",
  world_setting: "Fallen kingdom",
  world_rules: "Relics demand a cost",
  magic_system: "Blood-bound artifacts",
  important_locations: "Ruined chapel|Royal crypt",
  important_organizations: "The Ash Court|Temple Guard",
  technology_level: "pre-industrial",
  social_structure: "noble houses",
  video_format: "short-episode",
  aspect_ratio: "16:9",
  visual_style: "cinematic dark fantasy anime-realism",
  camera_style: "slow cinematic camera movement",
  image_style_notes: "moonlit contrast",
  video_motion_style: "subtle atmospheric motion",
  voiceover_style: "dramatic narration",
  subtitle_style: "clean readable subtitles",
  total_chapters: 10,
  target_words_min: 1800,
  target_words_max: 2500,
  scenes_min: 8,
  scenes_max: 12,
  characters_json:
    '[{"id":"protagonist","name":"Arin","role":"protagonist","visualDescription":"Black hair, silver eyes","personality":["reserved"],"relationships":[]}]',
};

export function createExcelTemplateWorkbook(): XLSX.WorkBook {
  const worksheet = XLSX.utils.json_to_sheet([templateRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "NovaImport");
  return workbook;
}
```

- [ ] **Step 4: Commit the template generator**

```bash
git add package.json package-lock.json src/frontend/importers/excelTemplate.ts
git commit -m "feat: add excel import template generator"
```

### Task 4: Wire import and template actions into the workspace UI

**Files:**

- Modify: `src/frontend/components/ProductionForm.tsx`
- Modify: `src/frontend/styles.css`
- Modify: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Extend the app test to assert the import and template actions**

```tsx
expect(
  screen.getByRole("button", { name: /import excel/i }),
).toBeInTheDocument();
expect(
  screen.getByRole("button", { name: /tải file mẫu/i }),
).toBeInTheDocument();
```

- [ ] **Step 2: Run the frontend app test to verify it fails**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: FAIL because the workspace does not yet render the import actions.

- [ ] **Step 3: Add local import state and file handling to `ProductionForm`**

```tsx
import * as XLSX from "xlsx";
import { parseExcelProductionRows } from "../importers/excelProductionInput";
import { createExcelTemplateWorkbook } from "../importers/excelTemplate";

const fileInputRef = useRef<HTMLInputElement | null>(null);
const [importError, setImportError] = useState("");

async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const parsed = parseExcelProductionRows(rows);
    setForm(parsed);
    setImportError("");
  } catch (error) {
    setImportError(
      error instanceof Error ? error.message : "Import Excel thất bại.",
    );
  } finally {
    event.target.value = "";
  }
}

function handleDownloadTemplate() {
  const workbook = createExcelTemplateWorkbook();
  XLSX.writeFile(workbook, "nova-production-template.xlsx");
}
```

- [ ] **Step 4: Render the new actions and hidden file input**

```tsx
<div className="workspace-actions">
  <button type="submit" className="primary-action">
    Bắt đầu sản xuất
  </button>
  <button
    type="button"
    className="secondary-action"
    onClick={() => fileInputRef.current?.click()}
  >
    Import Excel
  </button>
  <button
    type="button"
    className="secondary-action"
    onClick={handleDownloadTemplate}
  >
    Tải file mẫu
  </button>
  <input
    ref={fileInputRef}
    type="file"
    accept=".xlsx,.xls"
    onChange={handleImportFile}
    hidden
  />
</div>
```

- [ ] **Step 5: Add strict error UI styling**

```css
.import-error-box {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(165, 51, 31, 0.24);
  background: rgba(255, 237, 232, 0.94);
  color: #8b2c1f;
}
```

- [ ] **Step 6: Run the frontend app test to verify it passes**

Run: `npm run test -- tests/frontend/App.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit the UI import wiring**

```bash
git add src/frontend/components/ProductionForm.tsx src/frontend/styles.css tests/frontend/App.test.tsx
git commit -m "feat: add excel import actions to production workspace"
```

### Task 5: Add strict error surfacing and documentation, then verify everything

**Files:**

- Modify: `src/frontend/components/ProductionForm.tsx`
- Modify: `README.md`
- Test: `tests/frontend/excelProductionInput.test.ts`
- Test: `tests/frontend/App.test.tsx`

- [ ] **Step 1: Render import errors without partially mutating form state**

```tsx
{importError ? (
  <p className="import-error-box" role="alert">
    {importError}
  </p>
) : null}
```

- [ ] **Step 2: Update the README with the one-sheet import contract**

```md
## Excel Import

The workspace supports strict Excel import from one sheet with one data row.

- Use the first sheet only
- Provide exactly one populated row
- Use `|` for flat list fields such as `genres`
- Put all characters in the `characters_json` column as a JSON array
- Use the `Tải file mẫu` action in the UI to download a valid workbook template
```

- [ ] **Step 3: Run targeted frontend tests**

Run: `npm run test -- tests/frontend/excelProductionInput.test.ts tests/frontend/App.test.tsx`
Expected: PASS

- [ ] **Step 4: Run the full test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit the finished import feature**

```bash
git add src/frontend/components/ProductionForm.tsx README.md
git commit -m "feat: add strict excel import for production setup"
```

## Self-Review

- Spec coverage: the plan covers strict one-sheet parsing, one-row validation, `characters_json`, template download, frontend-only implementation, Vietnamese error messaging, and README updates.
- Placeholder scan: there are no deferred `TODO` or vague “handle this later” steps.
- Type consistency: the parser returns `ProductionInput`, the UI uses `parseExcelProductionRows`, and the template generator emits exactly the same column contract described in the spec.
