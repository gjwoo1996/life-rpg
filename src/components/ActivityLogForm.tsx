import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useCharacterStore } from "../stores/characterStore";

interface XpResult {
  intelligence: number;
  discipline: number;
  focus: number;
  knowledge: number;
  health: number;
}

export function ActivityLogForm() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [xpGained, setXpGained] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const createLog = useCharacterStore((s) => s.createLog);

  const handleAiAnalyze = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await invoke<XpResult>("analyze_activity", {
        content: content.trim(),
      });
      const total =
        result.intelligence +
        result.discipline +
        result.focus +
        result.knowledge +
        result.health;
      setXpGained(total);
    } catch (e) {
      setAiError(String(e));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !content.trim()) return;
    setLoading(true);
    await createLog(date, content.trim(), xpGained);
    setLoading(false);
    setContent("");
    setXpGained(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
    >
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={loading}
        />
        <input
          type="number"
          min={0}
          value={xpGained}
          onChange={(e) => setXpGained(parseInt(e.target.value) || 0)}
          placeholder="획득 XP"
          className="w-24 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleAiAnalyze}
          disabled={aiLoading || loading || !content.trim()}
          className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {aiLoading ? "AI 분석 중..." : "AI 분석"}
        </button>
      </div>
      {aiError && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {aiError}
        </p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 한 활동을 기록하세요..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? "저장 중..." : "기록 저장"}
      </button>
    </form>
  );
}
