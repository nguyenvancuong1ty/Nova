import { useState, type FormEvent } from "react";
import type { CharacterInput, ProductionInput } from "../../types";
import { CharacterForm } from "./CharacterForm";

interface ProductionFormProps {
  onStarted: (runId: string) => void;
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

export function ProductionForm({ onStarted }: ProductionFormProps) {
  const [form, setForm] = useState<ProductionInput>(defaultInput);
  const [outputPathHint, setOutputPathHint] = useState("");
  const [error, setError] = useState("");

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

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <section
        style={{ border: "1px solid #d0d7de", padding: 16, borderRadius: 12 }}
      >
        <h2>Novel Production Setup</h2>
        <label>
          Project Title
          <input
            aria-label="Project Title"
            value={form.project.title}
            onChange={(event) =>
              setForm({
                ...form,
                project: { ...form.project, title: event.target.value },
              })
            }
          />
        </label>
        <label>
          Creator Name
          <input
            value={form.project.creatorName ?? ""}
            onChange={(event) =>
              setForm({
                ...form,
                project: { ...form.project, creatorName: event.target.value },
              })
            }
          />
        </label>
        <label>
          Total Chapters
          <input
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
        <label>
          Main Premise
          <textarea
            value={form.story.mainPremise}
            onChange={(event) =>
              setForm({
                ...form,
                story: { ...form.story, mainPremise: event.target.value },
              })
            }
          />
        </label>
        <label>
          Visual Style
          <input
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

      <section style={{ display: "grid", gap: 12 }}>
        <h2>Characters</h2>
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
          Add Character
        </button>
      </section>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="submit">Start Production</button>
        <button type="button" onClick={() => setForm(defaultInput)}>
          Reset Form
        </button>
        <button type="button">Open Output Folder</button>
        <button type="button">View Logs</button>
      </div>

      {error ? <p>{error}</p> : null}
      {outputPathHint ? <p>Output Path: {outputPathHint}</p> : null}
    </form>
  );
}
