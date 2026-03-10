import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Character, Goal, ActivityLog } from "../types";

interface CharacterState {
  character: Character | null;
  goals: Goal[];
  logs: ActivityLog[];
  loadCharacter: () => Promise<void>;
  createCharacter: (name: string) => Promise<Character | null>;
  loadGoals: () => Promise<void>;
  createGoal: (name: string, startDate: string, endDate: string, targetSkill: string, calendarColor?: string) => Promise<Goal | null>;
  loadLogs: (fromDate?: string, toDate?: string) => Promise<void>;
  createLog: (date: string, content: string) => Promise<ActivityLog | null>;
  resetApp: () => Promise<void>;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  character: null,
  goals: [],
  logs: [],

  loadCharacter: async () => {
    try {
      const char = await invoke<Character | null>("get_character");
      set({ character: char });
      if (char) {
        get().loadGoals();
        get().loadLogs();
      }
    } catch (e) {
      console.error("loadCharacter failed:", e);
    }
  },

  createCharacter: async (name: string) => {
    try {
      const char = await invoke<Character>("create_character", { name });
      set({ character: char });
      return char;
    } catch (e) {
      console.error("createCharacter failed:", e);
      return null;
    }
  },

  loadGoals: async () => {
    const { character } = get();
    if (!character) return;
    try {
      const goals = await invoke<Goal[]>("list_goals", { characterId: character.id });
      set({ goals });
    } catch (e) {
      console.error("loadGoals failed:", e);
    }
  },

  createGoal: async (name: string, startDate: string, endDate: string, targetSkill: string, calendarColor?: string) => {
    const { character } = get();
    if (!character) return null;
    try {
      const goal = await invoke<Goal>("create_goal", {
        characterId: character.id,
        name,
        startDate,
        endDate,
        targetSkill,
        calendarColor: calendarColor ?? null,
      });
      set((s) => ({ goals: [goal, ...s.goals] }));
      return goal;
    } catch (e) {
      console.error("createGoal failed:", e);
      return null;
    }
  },

  loadLogs: async (fromDate?: string, toDate?: string) => {
    const { character } = get();
    if (!character) return;
    try {
      const logs = await invoke<ActivityLog[]>("list_activity_logs", {
        characterId: character.id,
        fromDate: fromDate ?? null,
        toDate: toDate ?? null,
      });
      set({ logs });
    } catch (e) {
      console.error("loadLogs failed:", e);
    }
  },

  createLog: async (date: string, content: string) => {
    const { character } = get();
    if (!character) return null;
    const log = await invoke<ActivityLog>("create_activity_log", {
      characterId: character.id,
      date,
      content,
    });
    set((s) => ({ logs: [log, ...s.logs] }));
    return log;
  },

  resetApp: async () => {
    try {
      await invoke("reset_app");
      set({ character: null, goals: [], logs: [] });
    } catch (e) {
      console.error("resetApp failed:", e);
    }
  },
}));
