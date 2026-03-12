import { useEffect, useState } from "react";
import { useCharacterStore } from "../stores/characterStore";
import { PixelCharacter } from "./PixelCharacter";
import type { AbilityStat } from "../types";
import { invoke } from "@tauri-apps/api/core";

const MAX_XP = 100;
const MAX_LEVEL = 10;

function levelFromXp(xp: number): number {
  return Math.min(MAX_LEVEL, 1 + Math.floor(xp / 10));
}

export function CharacterView() {
  const { character } = useCharacterStore();
  const [abilityStats, setAbilityStats] = useState<AbilityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!character) return;
    setLoading(true);
    invoke<AbilityStat[]>("get_ability_stats", { characterId: character.id })
      .then(setAbilityStats)
      .catch(() => setAbilityStats([]))
      .finally(() => setLoading(false));
  }, [character]);

  if (!character) return null;

  return (
    <section className="flex flex-col md:flex-row gap-8 items-center p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
      <PixelCharacter level={character.level} />
      <div className="flex-1 min-w-0 w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {character.name}
        </h1>
        <div className="flex gap-4 text-slate-500 mb-4">
          <span>Lv.{character.level}</span>
          <span>{character.xp} XP</span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {abilityStats.map((stat, index) => {
              const level = levelFromXp(stat.xp);
              const pct = Math.min(100, (stat.xp / MAX_XP) * 100);
              const isFocused = focusedIndex === index;
              return (
                <div key={stat.ability_id} className="group">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-700 shrink-0">
                      {stat.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Lv.{level} ({stat.xp}/{MAX_XP})
                    </span>
                  </div>
                  <div
                    tabIndex={0}
                    className="relative h-5 rounded-full bg-slate-100 overflow-visible outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 transition-all cursor-default"
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onMouseLeave={() => setFocusedIndex(null)}
                  >
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out overflow-hidden"
                      style={{ width: `${pct}%` }}
                    />
                    {isFocused && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full bg-amber-500/90 text-xs font-medium text-amber-950 transition-opacity duration-200"
                        role="tooltip"
                      >
                        총 경험치 {MAX_XP} 중 현재 {stat.xp} · Lv.{level}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {abilityStats.length === 0 && (
              <p className="text-slate-500 text-sm">
                목표를 추가하면 능력이 여기에 표시됩니다.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
