import React from 'react';
import { Trash2, X, Clock, Copy, Check } from 'lucide-react';
import { HistoryItem, ThemeColors } from '../types/calculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  theme: ThemeColors;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
  theme,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-h-[85%] rounded-t-3xl flex flex-col p-4 shadow-2xl border-t border-white/10 overflow-hidden"
        style={{ backgroundColor: theme.bgSurface }}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-600/50 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-white text-base">Calculation History</h3>
            <span className="text-xs text-slate-400">({history.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1 font-medium"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2 max-h-[400px]">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <p>No calculation history yet.</p>
              <p className="text-xs text-slate-500 mt-1">Calculations will appear here as you solve equations.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex flex-col items-end group relative"
              >
                <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="tabular-nums">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <button
                    onClick={(e) => handleCopy(item.id, item.result, e)}
                    className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
                    title="Copy result"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-sm text-slate-300 font-mono tracking-tight">{item.expression}</div>
                <div className="text-xl font-bold font-mono tracking-tight" style={{ color: theme.accentColor }}>
                  = {item.result}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
