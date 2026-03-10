import { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useCharacterStore } from "../stores/characterStore";
import type { ActivityLog } from "../types";

function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const startPad = first.getDay();
  for (let i = 0; i < startPad; i++) {
    days.unshift(new Date(year, month, -startPad + i + 1));
  }
  return days;
}

function dateToYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameMonth(d: Date, year: number, month: number): boolean {
  return d.getFullYear() === year && d.getMonth() === month;
}

export function ActivityPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { character, goals, logs, loadLogs } = useCharacterStore();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  useEffect(() => {
    if (!character) return;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    loadLogs(dateToYmd(start), dateToYmd(end));
  }, [character, year, month, loadLogs]);

  if (!character) return null;

  const days = getMonthDays(year, month);
  const logsByDate = logs.reduce<Record<string, ActivityLog[]>>((acc, log) => {
    (acc[log.date] = acc[log.date] || []).push(log);
    return acc;
  }, {});

  const activeGoalsInRange = goals.filter((g) => {
    const start = new Date(g.start_date);
    const end = new Date(g.end_date);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-700">활동 기록</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevMonth}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
            aria-label="이전 달"
          >
            ←
          </button>
          <span className="text-slate-700 font-medium min-w-[120px] text-center">
            {year}년 {month + 1}월
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
            aria-label="다음 달"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} className="font-medium text-slate-500 py-1">
            {w}
          </div>
        ))}
        {days.map((d) => {
          const ymd = dateToYmd(d);
          const inMonth = isSameMonth(d, year, month);
          const dayLogs = logsByDate[ymd] || [];
          const dayGoals = activeGoalsInRange.filter((g) => {
            const start = new Date(g.start_date);
            const end = new Date(g.end_date);
            const t = new Date(ymd);
            return t >= start && t <= end;
          });
          const summary = dayLogs.length
            ? dayLogs[0].summary || dayLogs[0].content.slice(0, 20) + (dayLogs[0].content.length > 20 ? "…" : "")
            : "";

          return (
            <button
              key={ymd}
              type="button"
              onClick={() => navigate(`/activity/${ymd}`)}
              className={`min-h-[72px] p-1 rounded-lg border text-left transition-colors ${
                inMonth
                  ? "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50"
                  : "bg-slate-50 border-slate-100 text-slate-400"
              } ${date === ymd ? "ring-2 ring-amber-500 border-amber-500" : ""}`}
            >
              <span className={inMonth ? "text-slate-800" : "text-slate-400"}>
                {d.getDate()}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {dayGoals.slice(0, 3).map((g) => (
                  <span
                    key={g.goal_id}
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: g.calendar_color || "#6366f1" }}
                    title={g.name}
                  />
                ))}
              </div>
              {summary && (
                <p className="text-xs text-slate-500 truncate mt-0.5" title={summary}>
                  {summary}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
