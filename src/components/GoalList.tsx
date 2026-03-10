import { useCharacterStore } from "../stores/characterStore";

export function GoalList() {
  const { goals } = useCharacterStore();

  if (goals.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-4">등록된 목표가 없습니다.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {goals.map((g) => (
        <li
          key={g.goal_id}
          className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <div>
            <span className="font-medium text-slate-800">{g.name}</span>
            <span className="text-slate-500 text-sm ml-2">
              {g.start_date} ~ {g.end_date}
            </span>
          </div>
          <span className="text-amber-600 text-sm font-medium">
            {g.target_skill}
          </span>
        </li>
      ))}
    </ul>
  );
}
