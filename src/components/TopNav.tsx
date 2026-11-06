import React from 'react';
import { Download, Terminal } from 'lucide-react';

interface TopNavProps {
  activeView: 'calculator' | 'no-gradle';
  onSelectView: (view: 'calculator' | 'no-gradle') => void;
  onDownloadProject: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  onDownloadProject,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
          A
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Android Calculator
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectView('calculator')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'calculator' ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
        >
          App Simulator
        </button>
        <button
          onClick={() => onSelectView('no-gradle')}
          className={`transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'no-gradle' ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
        >
          Build System (No Gradle)
        </button>
        <button
          onClick={() => onSelectView('no-gradle')}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          CLI Toolchain
        </button>
        <button
          onClick={() => onSelectView('no-gradle')}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Source Tree
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDownloadProject}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export Source ZIP</span>
        </button>
      </div>
    </header>
  );
};
