import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useCharacterStore } from "../stores/characterStore";
export function AnalysisPage() {
  const { character, goals } = useCharacterStore();
  const [goalAnalyses, setGoalAnalyses] = useState<Record<number, string | null>>({});

  useEffect(() => {
    if (!character || goals.length === 0) return;
    const map: Record<number, string | null> = {};
    Promise.all(
      goals.map((g) =>
        invoke<string | null>("get_goal_analysis", { goalId: g.goal_id })
          .then((v) => { map[g.goal_id] = v; })
          .catch(() => { map[g.goal_id] = null; })
      )
    ).then(() => setGoalAnalyses(map));
  }, [character, goals]);

  if (!character) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-700">사용자 분석</h2>
      <p className="text-slate-600 text-sm">
        목표와 활동기록을 바탕으로 한 분석 결과입니다. 활동을 추가할 때마다 목표별 누적 분석이 갱신됩니다.
      </p>
      {goals.length === 0 ? (
        <p className="text-slate-500 text-sm">등록된 목표가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => (
            <li
              key={g.goal_id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: g.calendar_color || "#6366f1" }}
                />
                <span className="font-medium text-slate-800">{g.name}</span>
                <span className="text-slate-500 text-sm">({g.target_skill})</span>
              </div>
              {goalAnalyses[g.goal_id] ? (
                <p className="text-slate-600 text-sm whitespace-pre-wrap mt-2 pl-5">
                  {goalAnalyses[g.goal_id]}
                </p>
              ) : (
                <p className="text-slate-400 text-sm mt-2 pl-5">
                  아직 목표별 누적 분석이 없습니다. 활동을 기록하면 분석이 생성됩니다.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
