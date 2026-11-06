import React from 'react';
import { X, Check, Palette } from 'lucide-react';
import { ThemeId, ThemeColors } from '../types/calculator';
import { THEMES } from '../data/themes';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  theme: ThemeColors;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-h-[85%] rounded-t-3xl flex flex-col p-4 shadow-2xl border-t border-white/10 overflow-hidden"
        style={{ backgroundColor: theme.bgSurface }}
      >
        <div className="w-12 h-1.5 bg-slate-600/50 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-white text-base">Material You Palette</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 py-4">
          {(Object.values(THEMES) as ThemeColors[]).map((t) => {
            const isSelected = t.id === currentThemeId;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center -space-x-1">
                    <div
                      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: t.primaryKeyBg }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: t.equalKeyBg }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white">{t.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
