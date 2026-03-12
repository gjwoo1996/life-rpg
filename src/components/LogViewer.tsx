import { useEffect, useRef, useState } from "react";
import { useLogStore, type AppLogEntry, type LogLevel, type LogSource } from "../stores/logStore";

const levelColors: Record<LogLevel, string> = {
  trace: "text-slate-500",
  debug: "text-slate-600",
  info: "text-slate-800",
  warn: "text-amber-600",
  error: "text-red-600",
};

const SOURCE_TABS: { id: LogSource; label: string }[] = [
  { id: "rust", label: "Rust 처리" },
  { id: "llm", label: "LLM" },
  { id: "ollama", label: "Ollama" },
];

function LogLine({ entry }: { entry: AppLogEntry }) {
  const levelClass = levelColors[entry.level] ?? "text-slate-800";
  const time = new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`font-mono text-xs py-1 px-2 border-b border-slate-100 ${levelClass}`}
      title={entry.timestamp}
    >
      <span className="text-slate-400 mr-2">{time}</span>
      <span className="font-medium uppercase mr-2">{entry.level}</span>
      <span>{entry.message}</span>
    </div>
  );
}

interface LogViewerProps {
  onClose: () => void;
}

export function LogViewer({ onClose }: LogViewerProps) {
  const { logs, clearLogs } = useLogStore();
  const [activeTab, setActiveTab] = useState<LogSource>("rust");
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((entry) => entry.source === activeTab);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredLogs.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">프로그램 로그</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearLogs}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              비우기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            >
              닫기
            </button>
          </div>
        </div>
        <div className="flex border-b border-slate-200">
          {SOURCE_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overflow-auto flex-1 bg-slate-50 p-2 min-h-[200px]">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              {activeTab === "rust" ? "Rust 처리 로그가 없습니다." : activeTab === "llm" ? "LLM 로그가 없습니다." : "Ollama 로그가 없습니다."}
            </p>
          ) : (
            filteredLogs.map((entry) => <LogLine key={entry.id} entry={entry} />)
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
