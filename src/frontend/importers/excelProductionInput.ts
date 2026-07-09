import { ZodError } from "zod";
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
  const normalized =
    typeof value === "number" ? value : Number(String(value ?? "").trim());

  if (!Number.isFinite(normalized)) {
    throw new Error(`Cột số không hợp lệ: ${key}`);
  }

  return normalized;
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

function formatZodIssuePath(path: (string | number)[]): string {
  return path.map(String).join(".");
}

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

  try {
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
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const issuePath = formatZodIssuePath(
        firstIssue.path as Array<string | number>,
      );
      throw new Error(
        issuePath
          ? `Dữ liệu import không hợp lệ tại ${issuePath}: ${firstIssue.message}`
          : `Dữ liệu import không hợp lệ: ${firstIssue.message}`,
      );
    }

    throw error;
  }
}
