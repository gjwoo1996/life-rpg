import { useState, useRef, useEffect } from "react";
import { useCharacterStore } from "../stores/characterStore";

interface AppHeaderProps {
  onOpenLogViewer: () => void;
}

export function AppHeader({ onOpenLogViewer }: AppHeaderProps) {
  const { character } = useCharacterStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleLogViewer = () => {
    setMenuOpen(false);
    onOpenLogViewer();
  };

  const handleReset = () => {
    setMenuOpen(false);
    const ok = window.confirm(
      "캐릭터·목표·활동 기록이 모두 삭제됩니다. 계속할까요?"
    );
    if (ok) {
      useCharacterStore.getState().resetApp();
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="메뉴"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 py-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
              <button
                type="button"
                onClick={handleLogViewer}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-t-lg"
              >
                로그 보기
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-b-lg"
              >
                초기화
              </button>
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-800 truncate">Life RPG</h1>
        {character && (
          <span className="text-slate-500 text-sm truncate">
            {character.name} · Lv.{character.level}
          </span>
        )}
      </div>
    </header>
  );
}
