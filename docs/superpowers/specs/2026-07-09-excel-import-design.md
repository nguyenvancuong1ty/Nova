# Nova Excel Import Design

## Goal

Add a strict Excel import flow to the current Nova workspace so a user can fill the full production input from a single `.xlsx` file instead of typing every field manually.

The import must:

- Use one sheet only
- Read one source row only
- Require a strict column contract
- Parse `characters_json` from one JSON cell
- Fail the entire import if any required field is missing or invalid

The imported result must map directly into the existing `ProductionInputSchema`.

## Product Direction

This is an operational productivity feature, not a fuzzy AI-assisted importer.

The priority is:

1. Fast bulk input
2. Predictable mapping
3. Clear validation errors
4. No partial import state

If the file is malformed, the user should see exactly what is wrong and continue editing manually or fix the sheet and re-import.

## Input Format

The import uses a single worksheet.

Rules:

- Use the first sheet only
- Use exactly one populated data row
- The first row is the header row
- All required columns must exist
- Unknown extra columns may be ignored
- If more than one non-empty data row exists, import fails

## Column Contract

The sheet is a flat table with one row of data.

Expected columns include:

- `project_title`
- `creator_name`
- `language`
- `format`
- `genres`
- `tone`
- `target_audience`
- `main_premise`
- `main_conflict`
- `ending_direction`
- `opening_situation`
- `main_mystery`
- `romance_angle`
- `power_system_notes`
- `important_themes`
- `world_setting`
- `world_rules`
- `magic_system`
- `important_locations`
- `important_organizations`
- `technology_level`
- `social_structure`
- `video_format`
- `aspect_ratio`
- `visual_style`
- `camera_style`
- `image_style_notes`
- `video_motion_style`
- `voiceover_style`
- `subtitle_style`
- `total_chapters`
- `target_words_min`
- `target_words_max`
- `scenes_min`
- `scenes_max`
- `characters_json`

## Array Encoding

Flat array fields use a fixed delimiter:

- `genres`
- `important_themes`
- `important_locations`
- `important_organizations`

Recommended delimiter:

- vertical bar `|`

Example:

- `dark fantasy|romance|political intrigue`

Whitespace around each item should be trimmed.

Empty array results are invalid for required array fields.

## Character Encoding

`characters_json` contains a single JSON array in one cell.

It must map to the current `CharacterInputSchema` contract.

Example shape:

```json
[
  {
    "id": "protagonist",
    "name": "Arin",
    "role": "protagonist",
    "visualDescription": "Black hair, silver eyes",
    "personality": ["reserved", "curious"],
    "motivation": "Protect the crown",
    "fear": "Losing identity",
    "secret": "Already linked to the relic",
    "voice": "Measured and wary",
    "relationships": []
  }
]
```

If the JSON is malformed or schema-invalid, import fails.

## Validation Behavior

The importer is strict.

Strict means:

- missing required column: fail
- invalid enum: fail
- malformed JSON: fail
- invalid number: fail
- invalid schema after mapping: fail
- multiple data rows: fail
- no data rows: fail

The form should not be partially updated on failure.

## User Experience

The workspace panel gets two related actions:

- `Import Excel`
- `Tải file mẫu`

### Import flow

1. User clicks `Import Excel`
2. User selects a `.xlsx` file
3. Frontend reads the first sheet
4. Frontend parses the single data row into `ProductionInput`
5. Frontend validates with `ProductionInputSchema`
6. If valid, the whole form state is replaced
7. If invalid, no form state is changed and the UI shows a strict error summary

### Error display

The error surface should be visible near the workspace actions.

It should list:

- missing columns
- invalid cell values
- schema errors after mapping
- `characters_json` parse errors
- row-count errors

The error copy should be Vietnamese-first and operational, for example:

- `Thiếu cột bắt buộc: project_title`
- `characters_json không phải JSON hợp lệ`
- `aspect_ratio không hợp lệ. Giá trị cho phép: 16:9, 9:16, 1:1`
- `File phải có đúng 1 dòng dữ liệu`

## Template Download

The UI should provide a downloadable template workbook.

Template requirements:

- one sheet
- one header row
- one valid example row
- `characters_json` filled with valid sample JSON

This avoids documentation-only onboarding and reduces import failure rate.

The template can be generated in one of two ways:

- static file shipped in the frontend/public asset path
- generated in-browser from a constant dataset

For this scope, a generated client-side workbook is acceptable if it stays simple.

## Parsing Boundary

The parser should live in a focused frontend-side utility module, not inside the React component.

Expected structure:

- file selection and action wiring in the component
- Excel parsing and row extraction in an importer utility
- mapping and validation in a dedicated parser module

This keeps the UI component small and makes test coverage easier.

## Proposed Module Boundaries

Expected new files:

- `src/frontend/importers/excelProductionInput.ts`
- `src/frontend/importers/excelTemplate.ts`
- `tests/frontend/excelProductionInput.test.ts`

Expected modified files:

- `src/frontend/components/ProductionForm.tsx`
- `README.md`

The parser module should export a pure function that accepts worksheet-like row data and returns a validated `ProductionInput`.

## Testing Strategy

Minimum tests:

- parses a valid row into `ProductionInput`
- trims and splits pipe-delimited arrays correctly
- parses valid `characters_json`
- fails on missing required column
- fails on invalid enum values
- fails on malformed `characters_json`
- fails when there are zero data rows
- fails when there are multiple data rows

The React-level test only needs to verify that the new import action exists and that parser errors can be surfaced.

## Non-Goals

This feature does not include:

- multi-sheet import
- partial merge into existing form state
- fuzzy column matching
- AI-assisted file understanding
- CSV import
- backend-side import processing

## Risks and Controls

### Risk: import rules are too ambiguous

Control:

- fixed one-sheet format
- strict required columns
- template download

### Risk: component becomes bloated

Control:

- move parsing and template logic into separate importer modules

### Risk: users lose existing form edits after accidental import

Control:

- only replace form state after full parse + validation succeeds

### Risk: `characters_json` becomes the main failure source

Control:

- ship a valid example in the template
- return explicit JSON-specific error messages

## Acceptance Criteria

The feature is ready when:

- the user can import one valid `.xlsx` file and have the full form populated
- invalid files never partially mutate the form
- strict errors are shown in Vietnamese
- `characters_json` is parsed and validated against the real schema
- a template workbook is available from the UI
