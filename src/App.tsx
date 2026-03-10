import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { attachLogger } from "@tauri-apps/plugin-log";
import { CharacterSetup } from "./components/CharacterSetup";
import { CharacterView } from "./components/CharacterView";
import { GoalList } from "./components/GoalList";
import { GoalForm } from "./components/GoalForm";
import { ActivityLogForm } from "./components/ActivityLogForm";
import { AppHeader } from "./components/AppHeader";
import { LogViewer } from "./components/LogViewer";
import { useCharacterStore } from "./stores/characterStore";
import { useLogStore } from "./stores/logStore";
import { ActivityPage } from "./pages/ActivityPage";
import { ActivityDayPage } from "./pages/ActivityDayPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import type { LogLevel } from "./stores/logStore";

const PLUGIN_LOG_LEVEL_TO_OUR: Record<number, LogLevel> = {
  1: "trace",
  2: "debug",
  3: "info",
  4: "warn",
  5: "error",
};

function MainPage() {
  return (
    <div className="space-y-8">
      <CharacterView />
      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">목표</h2>
        <GoalForm />
        <GoalList />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">활동 기록 (오늘)</h2>
        <ActivityLogForm />
        <NavLink
          to="/activity"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          활동 캘린더 보기 →
        </NavLink>
      </section>
    </div>
  );
}

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
      <div className="max-w-4xl mx-auto space-y-6">
        <AppHeader onOpenLogViewer={() => setShowLogViewer(true)} />
        <nav className="flex gap-4 border-b border-slate-200 pb-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
              (isActive ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-100")
            }
          >
            홈
          </NavLink>
          <NavLink
            to="/activity"
            className={({ isActive }) =>
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
              (isActive ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-100")
            }
          >
            활동기록
          </NavLink>
          <NavLink
            to="/analysis"
            className={({ isActive }) =>
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
              (isActive ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-100")
            }
          >
            사용자 분석
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="activity" element={<ActivityPage />}>
            <Route path=":date" element={<ActivityDayPage />} />
          </Route>
          <Route path="analysis" element={<AnalysisPage />} />
        </Routes>
      </div>
      {showLogViewer && (
        <LogViewer onClose={() => setShowLogViewer(false)} />
      )}
    </div>
  );
}

export default App;
