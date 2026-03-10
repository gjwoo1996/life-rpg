import { useCharacterStore } from "../stores/characterStore";

export function ActivityLogList() {
  const { logs } = useCharacterStore();

  if (logs.length === 0) {
    return <p className="text-slate-500 text-sm">기록된 활동이 없습니다.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li
          key={log.log_id}
          className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-slate-500 text-sm">{log.date}</span>
            <span className="text-amber-500 font-medium">+{log.xp_gained} XP</span>
          </div>
          <p className="text-slate-200">{log.content}</p>
        </li>
      ))}
    </ul>
  );
}
