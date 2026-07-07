import type { CharacterInput } from "../../types";

interface CharacterFormProps {
  character: CharacterInput;
  index: number;
  onChange: (character: CharacterInput) => void;
}

export function CharacterForm({
  character,
  index,
  onChange,
}: CharacterFormProps) {
  return (
    <fieldset
      style={{ border: "1px solid #d0d7de", padding: 16, borderRadius: 12 }}
    >
      <legend>Character {index + 1}</legend>
      <label>
        Name
        <input
          aria-label={`Character ${index + 1} Name`}
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
      <label>
        Role
        <select
          value={character.role}
          onChange={(event) =>
            onChange({
              ...character,
              role: event.target.value as CharacterInput["role"],
            })
          }
        >
          <option value="protagonist">Protagonist</option>
          <option value="antagonist">Antagonist</option>
          <option value="supporting">Supporting</option>
          <option value="mentor">Mentor</option>
          <option value="love_interest">Love Interest</option>
          <option value="rival">Rival</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        Visual Description
        <textarea
          value={character.visualDescription}
          onChange={(event) =>
            onChange({ ...character, visualDescription: event.target.value })
          }
        />
      </label>
    </fieldset>
  );
}
