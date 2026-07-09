import * as XLSX from "xlsx";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { parseExcelProductionRows } from "../importers/excelProductionInput";
import { createExcelTemplateWorkbook } from "../importers/excelTemplate";
import type { CharacterInput, ProductionInput } from "../../types";
import { CharacterForm } from "./CharacterForm";
import { WorkspaceTabs } from "./WorkspaceTabs";

interface ProductionFormProps {
  onStarted: (runId: string) => void;
  onCharacterCountChange: (count: number) => void;
}

const defaultCharacters: CharacterInput[] = [
  {
    id: "protagonist",
    name: "Arin",
    role: "protagonist",
    visualDescription: "Black hair, silver eyes",
    personality: [],
    relationships: [],
  },
  {
    id: "antagonist",
    name: "Veyra",
    role: "antagonist",
    visualDescription: "White armor, gold mask",
    personality: [],
    relationships: [],
  },
];

const defaultInput: ProductionInput = {
  project: {
    title: "The Shadow Crown",
    creatorName: "Nova",
    language: "Vietnamese",
    format: "webnovel",
    genres: ["dark fantasy"],
    tone: "dramatic",
    targetAudience: "young adult",
  },
  story: {
    mainPremise: "A cursed crown awakens.",
    mainConflict: "Power demands sacrifice.",
    endingDirection: "Bittersweet victory",
    openingSituation: "A ruined chapel discovery",
    mainMystery: "Who forged the crown?",
    romanceAngle: "Slow burn alliance",
    powerSystemNotes: "Relics bind memory",
    importantThemes: ["power", "identity"],
  },
  world: {
    worldSetting: "Fallen kingdom",
    worldRules: "Relics demand a cost",
    magicSystem: "Blood-bound artifacts",
    importantLocations: ["Ruined chapel"],
    importantOrganizations: ["The Ash Court"],
    technologyLevel: "pre-industrial",
    socialStructure: "noble houses",
  },
  characters: defaultCharacters,
  video: {
    videoFormat: "short-episode",
    aspectRatio: "16:9",
    visualStyle: "cinematic dark fantasy anime-realism",
    cameraStyle: "slow cinematic camera movement, dramatic close-ups",
    imageStyleNotes: "moonlit contrast",
    videoMotionStyle: "subtle atmospheric motion",
    voiceoverStyle: "dramatic narration",
    subtitleStyle: "clean readable subtitles",
  },
  chapterConfig: {
    totalChapters: 10,
    targetWordsPerChapter: { min: 1800, max: 2500 },
    scenesPerChapter: { min: 8, max: 12 },
  },
};

const workspaceTabs = ["Dự án", "Cốt truyện", "Nhân vật", "Video"] as const;

export function ProductionForm({
  onStarted,
  onCharacterCountChange,
}: ProductionFormProps) {
  const [form, setForm] = useState<ProductionInput>(defaultInput);
  const [activeTab, setActiveTab] =
    useState<(typeof workspaceTabs)[number]>("Dự án");
  const [outputPathHint, setOutputPathHint] = useState("");
  const [error, setError] = useState("");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onCharacterCountChange(form.characters.length);
  }, [form.characters.length, onCharacterCountChange]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/production/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Failed to start production.");
      return;
    }

    setOutputPathHint(payload.outputPath ?? "");
    onStarted(payload.runId);
  }

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

      if (!sheet) {
        throw new Error("Không tìm thấy sheet dữ liệu trong file Excel.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });
      const parsed = parseExcelProductionRows(rows);
      setForm(parsed);
      setImportError("");
      setError("");
      setOutputPathHint("");
    } catch (nextError) {
      setImportError(
        nextError instanceof Error
          ? nextError.message
          : "Import Excel thất bại.",
      );
    } finally {
      event.target.value = "";
    }
  }

  function handleDownloadTemplate() {
    const workbook = createExcelTemplateWorkbook();
    XLSX.writeFile(workbook, "nova-production-template.xlsx");
  }

  return (
    <form className="workspace-panel" onSubmit={handleSubmit}>
      <div className="workspace-panel__header">
        <div>
          <p className="eyebrow">Cấu hình dự án</p>
          <h2>Thiết lập cốt lõi</h2>
        </div>
        <WorkspaceTabs
          tabs={workspaceTabs}
          activeTab={activeTab}
          onChange={(tab) =>
            setActiveTab(tab as (typeof workspaceTabs)[number])
          }
        />
      </div>

      {activeTab === "Dự án" ? (
        <section className="field-grid">
          <label className="field-card">
            <span>Tên dự án</span>
            <input
              aria-label="Tên dự án"
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
            <span>Người tạo</span>
            <input
              aria-label="Người tạo"
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
            <span>Số chapter</span>
            <input
              aria-label="Số chapter"
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
            <span>Phong cách hình ảnh</span>
            <input
              aria-label="Phong cách hình ảnh"
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

      {activeTab === "Cốt truyện" ? (
        <section className="stack-fields">
          <label className="field-card">
            <span>Tiền đề chính</span>
            <textarea
              aria-label="Tiền đề chính"
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
            <span>Xung đột chính</span>
            <textarea
              aria-label="Xung đột chính"
              value={form.story.mainConflict}
              onChange={(event) =>
                setForm({
                  ...form,
                  story: { ...form.story, mainConflict: event.target.value },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>Hướng kết thúc</span>
            <textarea
              aria-label="Hướng kết thúc"
              value={form.story.endingDirection}
              onChange={(event) =>
                setForm({
                  ...form,
                  story: { ...form.story, endingDirection: event.target.value },
                })
              }
            />
          </label>
        </section>
      ) : null}

      {activeTab === "Nhân vật" ? (
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
            Thêm nhân vật
          </button>
        </section>
      ) : null}

      {activeTab === "Video" ? (
        <section className="field-grid">
          <label className="field-card">
            <span>Tỉ lệ khung hình</span>
            <select
              aria-label="Tỉ lệ khung hình"
              value={form.video.aspectRatio}
              onChange={(event) =>
                setForm({
                  ...form,
                  video: {
                    ...form.video,
                    aspectRatio: event.target.value as "16:9" | "9:16" | "1:1",
                  },
                })
              }
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </label>
          <label className="field-card">
            <span>Phong cách camera</span>
            <input
              aria-label="Phong cách camera"
              value={form.video.cameraStyle}
              onChange={(event) =>
                setForm({
                  ...form,
                  video: { ...form.video, cameraStyle: event.target.value },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>Motion video</span>
            <textarea
              aria-label="Motion video"
              value={form.video.videoMotionStyle}
              onChange={(event) =>
                setForm({
                  ...form,
                  video: {
                    ...form.video,
                    videoMotionStyle: event.target.value,
                  },
                })
              }
            />
          </label>
          <label className="field-card">
            <span>Phong cách voiceover</span>
            <textarea
              aria-label="Phong cách voiceover"
              value={form.video.voiceoverStyle}
              onChange={(event) =>
                setForm({
                  ...form,
                  video: { ...form.video, voiceoverStyle: event.target.value },
                })
              }
            />
          </label>
        </section>
      ) : null}

      <p className="workspace-note">
        Màn hình chính chỉ giữ các trường cốt lõi. Phần chi tiết được gom theo
        nhóm để dễ quét và đỡ mệt khi nhập.
      </p>

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
        <button
          type="button"
          className="secondary-action"
          onClick={() => setForm(defaultInput)}
        >
          Khôi phục mẫu
        </button>
        <button type="button" className="secondary-action">
          Mở thư mục output
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportFile}
          hidden
        />
      </div>

      {importError ? (
        <p className="import-error-box" role="alert">
          {importError}
        </p>
      ) : null}
      {error ? <p className="feedback feedback--error">{error}</p> : null}
      {outputPathHint ? (
        <p className="feedback">Đường dẫn output: {outputPathHint}</p>
      ) : null}
    </form>
  );
}
