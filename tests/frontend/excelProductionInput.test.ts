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
      parseExcelProductionRows([{ ...validRow, project_title: undefined }]),
    ).toThrow(/project_title/i);
  });

  it("fails when characters_json is malformed", () => {
    expect(() =>
      parseExcelProductionRows([{ ...validRow, characters_json: "[not-json]" }]),
    ).toThrow(/characters_json/i);
  });

  it("fails when there is more than one data row", () => {
    expect(() => parseExcelProductionRows([validRow, validRow])).toThrow(
      /đúng 1 dòng dữ liệu/i,
    );
  });
});
