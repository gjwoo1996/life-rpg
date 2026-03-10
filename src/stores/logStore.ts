import { create } from "zustand";

const MAX_LOGS = 500;

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export interface AppLogEntry {
  id: number;
  level: LogLevel;
  message: string;
  timestamp: string;
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
      };
      const logs = [entry, ...s.logs].slice(0, MAX_LOGS);
      return { logs, nextId: s.nextId + 1 };
    }),
  clearLogs: () => set({ logs: [], nextId: 1 }),
}));
