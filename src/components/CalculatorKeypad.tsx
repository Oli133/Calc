import React from 'react';
import { Delete } from 'lucide-react';
import { ThemeColors } from '../types/calculator';

interface CalculatorKeypadProps {
  onInput: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEvaluate: () => void;
  onParenthesis: () => void;
  theme: ThemeColors;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onInput,
  onClear,
  onBackspace,
  onEvaluate,
  onParenthesis,
  theme,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2.5 p-3 select-none">
      {/* Row 1 */}
      <button
        onClick={onClear}
        className="h-16 md:h-18 rounded-full text-xl font-bold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.actionKeyBg, color: theme.actionKeyText }}
      >
        C
      </button>
      <button
        onClick={onParenthesis}
        className="h-16 md:h-18 rounded-full text-xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.actionKeyBg, color: theme.actionKeyText }}
      >
        ( )
      </button>
      <button
        onClick={() => onInput('%')}
        className="h-16 md:h-18 rounded-full text-xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.actionKeyBg, color: theme.actionKeyText }}
      >
        %
      </button>
      <button
        onClick={() => onInput('÷')}
        className="h-16 md:h-18 rounded-full text-2xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.primaryKeyBg, color: theme.accentColor }}
      >
        ÷
      </button>

      {/* Row 2 */}
      <button
        onClick={() => onInput('7')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        7
      </button>
      <button
        onClick={() => onInput('8')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        8
      </button>
      <button
        onClick={() => onInput('9')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        9
      </button>
      <button
        onClick={() => onInput('×')}
        className="h-16 md:h-18 rounded-full text-2xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.primaryKeyBg, color: theme.accentColor }}
      >
        ×
      </button>

      {/* Row 3 */}
      <button
        onClick={() => onInput('4')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        4
      </button>
      <button
        onClick={() => onInput('5')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        5
      </button>
      <button
        onClick={() => onInput('6')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        6
      </button>
      <button
        onClick={() => onInput('−')}
        className="h-16 md:h-18 rounded-full text-2xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.primaryKeyBg, color: theme.accentColor }}
      >
        −
      </button>

      {/* Row 4 */}
      <button
        onClick={() => onInput('1')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        1
      </button>
      <button
        onClick={() => onInput('2')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        2
      </button>
      <button
        onClick={() => onInput('3')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        3
      </button>
      <button
        onClick={() => onInput('+')}
        className="h-16 md:h-18 rounded-full text-2xl font-semibold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.primaryKeyBg, color: theme.accentColor }}
      >
        +
      </button>

      {/* Row 5 */}
      <button
        onClick={() => onInput('0')}
        className="h-16 md:h-18 rounded-full text-2xl font-medium flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        0
      </button>
      <button
        onClick={() => onInput('.')}
        className="h-16 md:h-18 rounded-full text-2xl font-bold flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
      >
        .
      </button>
      <button
        onClick={onBackspace}
        className="h-16 md:h-18 rounded-full flex items-center justify-center transition-all duration-100 active:scale-90 active:brightness-125"
        style={{ backgroundColor: theme.numKeyBg, color: theme.numKeyText }}
        title="Backspace"
      >
        <Delete className="w-6 h-6" />
      </button>
      <button
        onClick={onEvaluate}
        className="h-16 md:h-18 rounded-full text-3xl font-bold flex items-center justify-center transition-all duration-100 active:scale-90 shadow-md active:shadow-none"
        style={{ backgroundColor: theme.equalKeyBg, color: theme.equalKeyText }}
        title="Calculate"
      >
        =
      </button>
    </div>
  );
};
