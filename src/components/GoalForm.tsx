import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useCharacterStore } from "../stores/characterStore";
import type { Ability } from "../types";

const PRESET_COLORS = ["#6366f1", "#22c55e", "#eab308", "#ef4444", "#ec4899", "#8b5cf6", "#0ea5e9", "#f97316"];
const CUSTOM_ABILITY_VALUE = "__custom__";

export function GoalForm() {
  const { character, loadGoals } = useCharacterStore();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [targetSkill, setTargetSkill] = useState("");
  const [customAbilityName, setCustomAbilityName] = useState("");
  const [calendarColor, setCalendarColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const createGoal = useCharacterStore((s) => s.createGoal);

  useEffect(() => {
    if (!character) return;
    invoke<Ability[]>("list_abilities", { characterId: character.id })
      .then(setAbilities)
      .catch(() => setAbilities([]));
  }, [character]);

  const resolvedAbilityName =
    targetSkill === CUSTOM_ABILITY_VALUE ? customAbilityName.trim() : targetSkill;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || !resolvedAbilityName) return;
    setLoading(true);
    await createGoal(name.trim(), startDate, endDate, resolvedAbilityName, calendarColor);
    setLoading(false);
    setName("");
    setStartDate("");
    setEndDate("");
    setCustomAbilityName("");
    if (targetSkill !== CUSTOM_ABILITY_VALUE) setTargetSkill("");
    loadGoals();
    invoke<Ability[]>("list_abilities", { characterId: character!.id })
      .then(setAbilities)
      .catch(() => {});
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
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-slate-600 text-sm shrink-0">능력</label>
        <select
          value={targetSkill}
          onChange={(e) => setTargetSkill(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={loading}
        >
          <option value="">선택 또는 직접 입력</option>
          {abilities.map((a) => (
            <option key={a.ability_id} value={a.name}>
              {a.name}
            </option>
          ))}
          <option value={CUSTOM_ABILITY_VALUE}>직접 입력</option>
        </select>
        {targetSkill === CUSTOM_ABILITY_VALUE && (
          <input
            type="text"
            value={customAbilityName}
            onChange={(e) => setCustomAbilityName(e.target.value)}
            placeholder="능력 이름 입력"
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[120px]"
            disabled={loading}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-slate-600 text-sm whitespace-nowrap">캘린더 색상</label>
        <input
          type="color"
          value={calendarColor}
          onChange={(e) => setCalendarColor(e.target.value)}
          className="w-9 h-9 rounded border border-slate-200 cursor-pointer"
          disabled={loading}
        />
        <div className="flex gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCalendarColor(c)}
              className="w-5 h-5 rounded-full border-2 border-slate-200 hover:border-slate-400 transition-colors"
              style={{ backgroundColor: c }}
              disabled={loading}
              aria-label={`색상 ${c}`}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim() || !resolvedAbilityName}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? "추가 중..." : "목표 추가"}
      </button>
    </form>
  );
}
