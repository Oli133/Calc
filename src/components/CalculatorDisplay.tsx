import React, { useRef, useEffect } from 'react';
import { History, Scale, Palette, MoreVertical } from 'lucide-react';
import { AngleMode, ThemeColors } from '../types/calculator';

interface CalculatorDisplayProps {
  expression: string;
  ghostResult: string;
  isEvaluated: boolean;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  onOpenHistory: () => void;
  onOpenConverter: () => void;
  onOpenThemes: () => void;
  theme: ThemeColors;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  ghostResult,
  isEvaluated,
  angleMode,
  onToggleAngleMode,
  onOpenHistory,
  onOpenConverter,
  onOpenThemes,
  theme,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression to the end on change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [expression]);

  // Dynamic font sizing based on expression length
  const getFontSizeClass = (len: number) => {
    if (len > 18) return 'text-2xl';
    if (len > 12) return 'text-3xl';
    if (len > 8) return 'text-4xl';
    return 'text-5xl';
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none min-h-[170px]">
      {/* Top App Header inside Calculator */}
      <div className="flex items-center justify-between text-slate-400">
        <button
          onClick={onToggleAngleMode}
          className="text-xs font-semibold px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors tracking-wider"
          title={`Click to switch to ${angleMode === 'DEG' ? 'Radians' : 'Degrees'}`}
        >
          {angleMode}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenConverter}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            title="Unit Converter"
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            title="Calculation History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenThemes}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            title="Material You Themes"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex flex-col items-end justify-end w-full overflow-hidden mt-auto">
        {/* Expression row */}
        <div
          ref={scrollRef}
          className={`w-full text-right font-medium tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none transition-all duration-150 ${
            isEvaluated ? 'text-slate-400 text-xl mb-1' : `text-white font-semibold ${getFontSizeClass(expression.length)}`
          }`}
          style={{ color: isEvaluated ? undefined : theme.primaryKeyText }}
        >
          {expression === '' ? (
            <span className="opacity-30">0</span>
          ) : (
            <span>{expression}</span>
          )}
          {!isEvaluated && <span className="inline-block w-0.5 h-7 ml-1 bg-amber-400 animate-pulse align-middle" />}
        </div>

        {/* Result row */}
        <div className="w-full text-right overflow-hidden text-ellipsis whitespace-nowrap min-h-[44px]">
          {isEvaluated ? (
            <span
              className="text-4xl md:text-5xl font-bold tracking-tight"
              style={{ color: theme.accentColor }}
            >
              {ghostResult}
            </span>
          ) : ghostResult ? (
            <span className="text-xl md:text-2xl font-medium opacity-60 tabular-nums">
              = {ghostResult}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
