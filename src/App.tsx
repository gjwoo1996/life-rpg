import { useEffect } from "react";
import { CharacterSetup } from "./components/CharacterSetup";
import { CharacterView } from "./components/CharacterView";
import { GoalList } from "./components/GoalList";
import { GoalForm } from "./components/GoalForm";
import { ActivityLogForm } from "./components/ActivityLogForm";
import { ActivityLogList } from "./components/ActivityLogList";
import { useCharacterStore } from "./stores/characterStore";

function App() {
  const { character, loadCharacter } = useCharacterStore();

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  if (!character) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <CharacterSetup />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <CharacterView />
        <section>
          <h2 className="text-xl font-bold mb-4">목표</h2>
          <GoalForm />
          <GoalList />
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">활동 기록</h2>
          <ActivityLogForm />
          <ActivityLogList />
        </section>
      </div>
    </div>
  );
}

export default App;
