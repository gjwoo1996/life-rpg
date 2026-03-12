import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useCharacterStore } from "../stores/characterStore";
import type { ActivityLog } from "../types";

export function ActivityDayPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { character } = useCharacterStore();
  const [dayLogs, setDayLogs] = useState<ActivityLog[]>([]);
  const [dailyAnalysis, setDailyAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (!character || !date) return;
    invoke<ActivityLog[]>("list_activity_logs", {
      characterId: character.id,
      fromDate: date,
      toDate: date,
    })
      .then(setDayLogs)
      .catch(() => setDayLogs([]));
    invoke<string | null>("get_daily_analysis", { characterId: character.id, date })
      .then((v) => setDailyAnalysis(v ?? null))
      .catch(() => setDailyAnalysis(null));
  }, [character, date]);

  if (!date) return null;

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{date} 활동</h3>
        <button
          type="button"
          onClick={() => navigate("/activity")}
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          캘린더로
        </button>
      </div>

      {dayLogs.length === 0 ? (
        <p className="text-slate-500 text-sm">이 날 기록된 활동이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {dayLogs.map((log) => (
            <li
              key={log.log_id}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/50"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-amber-600 font-medium">+{log.xp_gained} XP</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{log.content}</p>
            </li>
          ))}
        </ul>
      )}

      {(dayLogs.length > 0 || dailyAnalysis) && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">일일 분석</h4>
          {dailyAnalysis ? (
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{dailyAnalysis}</p>
          ) : (
            <p className="text-slate-400 text-sm">분석이 없습니다. 활동을 저장하면 생성됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
