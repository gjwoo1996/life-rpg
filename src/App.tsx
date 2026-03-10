import { useEffect, useState } from "react";
import { attachLogger } from "@tauri-apps/plugin-log";
import { CharacterSetup } from "./components/CharacterSetup";
import { CharacterView } from "./components/CharacterView";
import { GoalList } from "./components/GoalList";
import { GoalForm } from "./components/GoalForm";
import { ActivityLogForm } from "./components/ActivityLogForm";
import { ActivityLogList } from "./components/ActivityLogList";
import { AppHeader } from "./components/AppHeader";
import { LogViewer } from "./components/LogViewer";
import { useCharacterStore } from "./stores/characterStore";
import { useLogStore } from "./stores/logStore";
import type { LogLevel } from "./stores/logStore";

const PLUGIN_LOG_LEVEL_TO_OUR: Record<number, LogLevel> = {
  1: "trace",
  2: "debug",
  3: "info",
  4: "warn",
  5: "error",
};

function App() {
  const { character, loadCharacter } = useCharacterStore();
  const [showLogViewer, setShowLogViewer] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        unlisten = await attachLogger((record) => {
          const level =
            PLUGIN_LOG_LEVEL_TO_OUR[record.level as number] ?? "info";
          useLogStore.getState().addLog(level, record.message);
        });
      } catch {
        // not in Tauri or plugin not available
      }
    })();
    return () => {
      unlisten?.();
    };
  }, []);

  if (!character) {
    return (
      <div className="min-h-screen bg-amber-50/80 text-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <AppHeader onOpenLogViewer={() => setShowLogViewer(true)} />
          <CharacterSetup />
        </div>
        {showLogViewer && (
          <LogViewer onClose={() => setShowLogViewer(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/80 text-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <AppHeader onOpenLogViewer={() => setShowLogViewer(true)} />
        <CharacterView />
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">목표</h2>
          <GoalForm />
          <GoalList />
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            활동 기록
          </h2>
          <ActivityLogForm />
          <ActivityLogList />
        </section>
      </div>
      {showLogViewer && (
        <LogViewer onClose={() => setShowLogViewer(false)} />
      )}
    </div>
  );
}

export default App;
