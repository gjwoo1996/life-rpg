import { useState } from "react";
import { useCharacterStore } from "../stores/characterStore";

const SKILLS = ["intelligence", "focus", "discipline", "knowledge", "health"];

export function GoalForm() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetSkill, setTargetSkill] = useState("intelligence");
  const [loading, setLoading] = useState(false);
  const createGoal = useCharacterStore((s) => s.createGoal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setLoading(true);
    await createGoal(name.trim(), startDate, endDate, targetSkill);
    setLoading(false);
    setName("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-3 mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="목표 이름"
        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      />
      <select
        value={targetSkill}
        onChange={(e) => setTargetSkill(e.target.value)}
        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      >
        {SKILLS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? "추가 중..." : "목표 추가"}
      </button>
    </form>
  );
}
