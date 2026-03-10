import { useEffect, useState } from "react";
import { useCharacterStore } from "../stores/characterStore";
import { PixelCharacter } from "./PixelCharacter";
import type { Stats } from "../types";
import { invoke } from "@tauri-apps/api/core";

export function CharacterView() {
  const { character } = useCharacterStore();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!character) return;
    invoke<Stats>("get_stats", { characterId: character.id })
      .then(setStats)
      .catch(console.error);
  }, [character]);

  if (!character) return null;

  return (
    <section className="flex flex-col md:flex-row gap-8 items-center p-6 rounded-xl bg-slate-800/50 border border-slate-700">
      <PixelCharacter level={character.level} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">{character.name}</h1>
        <div className="flex gap-4 text-slate-400 mb-4">
          <span>Lv.{character.level}</span>
          <span>{character.xp} XP</span>
        </div>
        {stats && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>지능: {stats.intelligence}</div>
            <div>집중: {stats.focus}</div>
            <div>규율: {stats.discipline}</div>
            <div>지식: {stats.knowledge}</div>
            <div>체력: {stats.health}</div>
          </div>
        )}
      </div>
    </section>
  );
}
