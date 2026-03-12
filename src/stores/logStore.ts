import { create } from "zustand";

const MAX_LOGS = 500;

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export type LogSource = "rust" | "llm" | "ollama";

function sourceFromMessage(message: string): LogSource {
  if (message.startsWith("[LLM]")) return "llm";
  if (message.startsWith("[Ollama]")) return "ollama";
  return "rust";
}

export interface AppLogEntry {
  id: number;
  level: LogLevel;
  message: string;
  timestamp: string;
  source: LogSource;
}

interface LogState {
  logs: AppLogEntry[];
  nextId: number;
  addLog: (level: LogLevel, message: string) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  nextId: 1,
  addLog: (level, message) =>
    set((s) => {
      const entry: AppLogEntry = {
        id: s.nextId,
        level,
        message,
        timestamp: new Date().toISOString(),
        source: sourceFromMessage(message),
      };
      const logs = [entry, ...s.logs].slice(0, MAX_LOGS);
      return { logs, nextId: s.nextId + 1 };
    }),
  clearLogs: () => set({ logs: [], nextId: 1 }),
}));
