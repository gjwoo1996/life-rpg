import { useState } from "react";
import { useCharacterStore } from "../stores/characterStore";

export function CharacterSetup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const createCharacter = useCharacterStore((s) => s.createCharacter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await createCharacter(name.trim());
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-slate-600 mb-6">
        캐릭터를 생성하여 성장을 시작하세요.
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 rounded-xl bg-white border border-slate-200 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            캐릭터 이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? "생성 중..." : "캐릭터 생성"}
        </button>
      </form>
    </div>
  );
}
