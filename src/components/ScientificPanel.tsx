import React from 'react';
import { ThemeColors } from '../types/calculator';

interface ScientificPanelProps {
  isInv: boolean;
  onToggleInv: () => void;
  onInsert: (token: string) => void;
  theme: ThemeColors;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLandscape?: boolean;
}

export const ScientificPanel: React.FC<ScientificPanelProps> = ({
  isInv,
  onToggleInv,
  onInsert,
  theme,
  isExpanded,
  onToggleExpand,
  isLandscape = false,
}) => {
  return (
    <div className={`w-full transition-all duration-200 select-none ${isLandscape ? 'h-full' : ''}`}>
      {/* Drawer pull handle for portrait mode */}
      {!isLandscape && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/5">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <span
              className={`w-2 h-2 border-r-2 border-b-2 border-slate-400 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-45 translate-y-[-2px]' : '-rotate-45'
              }`}
            />
            <span>{isExpanded ? 'Hide Advanced' : 'Scientific Mode'}</span>
          </button>

          {isExpanded && (
            <button
              onClick={onToggleInv}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                isInv ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              INV {isInv ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      )}

      {/* Scientific Grid */}
      {(isExpanded || isLandscape) && (
        <div className="grid grid-cols-5 gap-1.5 p-2 bg-black/20 rounded-xl mb-1">
          {/* Row 1 */}
          <button
            onClick={onToggleInv}
            className={`h-11 rounded-full text-xs font-semibold flex items-center justify-center transition-transform active:scale-95 ${
              isInv ? 'bg-amber-400/30 text-amber-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            INV
          </button>
          <button
            onClick={() => onInsert(isInv ? 'asin(' : 'sin(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => onInsert(isInv ? 'acos(' : 'cos(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => onInsert(isInv ? 'atan(' : 'tan(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => onInsert('^')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            xʸ
          </button>

          {/* Row 2 */}
          <button
            onClick={() => onInsert(isInv ? 'e^(' : 'ln(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? 'eˣ' : 'ln'}
          </button>
          <button
            onClick={() => onInsert(isInv ? '10^(' : 'log(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? '10ˣ' : 'log'}
          </button>
          <button
            onClick={() => onInsert(isInv ? '^2' : '√(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            {isInv ? 'x²' : '√'}
          </button>
          <button
            onClick={() => onInsert('π')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            π
          </button>
          <button
            onClick={() => onInsert('e')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            e
          </button>

          {/* Row 3 */}
          <button
            onClick={() => onInsert('(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            (
          </button>
          <button
            onClick={() => onInsert(')')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            )
          </button>
          <button
            onClick={() => onInsert('!')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            !
          </button>
          <button
            onClick={() => onInsert('1/(')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            1/x
          </button>
          <button
            onClick={() => onInsert('%')}
            className="h-11 rounded-full text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 flex items-center justify-center transition-transform active:scale-95"
          >
            %
          </button>
        </div>
      )}
    </div>
  );
};
