import { useCharacterStore } from "../stores/characterStore";

export function GoalList() {
  const { goals } = useCharacterStore();

  if (goals.length === 0) {
    return <p className="text-slate-500 text-sm">등록된 목표가 없습니다.</p>;
  }

  return (
    <ul className="space-y-2">
      {goals.map((g) => (
        <li
          key={g.goal_id}
          className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700"
        >
          <div>
            <span className="font-medium">{g.name}</span>
            <span className="text-slate-500 text-sm ml-2">
              {g.start_date} ~ {g.end_date}
            </span>
          </div>
          <span className="text-amber-500 text-sm">{g.target_skill}</span>
        </li>
      ))}
    </ul>
  );
}
