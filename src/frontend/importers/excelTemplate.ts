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
