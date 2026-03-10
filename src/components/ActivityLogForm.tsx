import { useState } from "react";
import { useCharacterStore } from "../stores/characterStore";

function todayYmd(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function ActivityLogForm() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createLog = useCharacterStore((s) => s.createLog);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const date = todayYmd();
      const result = await createLog(date, content.trim());
      if (result) setContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const today = todayYmd();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
    >
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <span>날짜</span>
        <span className="font-medium text-slate-800">{today}</span>
        <span className="text-slate-400">(오늘만 기록 가능)</span>
      </div>
      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 한 활동을 기록하세요. 저장 시 AI가 분석해 경험치를 부여합니다."
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
