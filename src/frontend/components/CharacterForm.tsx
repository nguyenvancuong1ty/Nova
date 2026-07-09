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
    <fieldset className="character-card">
      <legend>Nhân vật {index + 1}</legend>
      <label className="field-card">
        <span>Tên nhân vật</span>
        <input
          aria-label={`Tên nhân vật ${index + 1}`}
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
      <label className="field-card">
        <span>Vai trò</span>
        <select
          value={character.role}
          onChange={(event) =>
            onChange({
              ...character,
              role: event.target.value as CharacterInput["role"],
            })
          }
        >
          <option value="protagonist">Nhân vật chính</option>
          <option value="antagonist">Phản diện</option>
          <option value="supporting">Hỗ trợ</option>
          <option value="mentor">Cố vấn</option>
          <option value="love_interest">Tuyến tình cảm</option>
          <option value="rival">Đối thủ</option>
          <option value="other">Khác</option>
        </select>
      </label>
      <label className="field-card">
        <span>Mô tả ngoại hình</span>
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
