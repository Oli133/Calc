import React, { useState } from 'react';
import { X, ArrowDownUp, Scale } from 'lucide-react';
import { UnitCategory, ThemeColors } from '../types/calculator';
import { UNIT_CATEGORIES, UNITS_BY_CATEGORY, convertUnits } from '../utils/unitConverter';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [valueStr, setValueStr] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');

  if (!isOpen) return null;

  const currentUnits = UNITS_BY_CATEGORY[category] || [];

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNITS_BY_CATEGORY[newCat];
    if (units && units.length >= 2) {
      setFromUnit(units[0].id);
      setToUnit(units[1].id);
    }
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const numericValue = parseFloat(valueStr) || 0;
  const converted = convertUnits(numericValue, category, fromUnit, toUnit);

  const formatConverted = (val: number) => {
    if (Math.abs(val) < 1e-6 && val !== 0) return val.toExponential(4);
    if (Math.abs(val) > 1e10) return val.toExponential(6);
    return Number(val.toFixed(6)).toLocaleString();
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-h-[90%] rounded-t-3xl flex flex-col p-4 shadow-2xl border-t border-white/10 overflow-hidden"
        style={{ backgroundColor: theme.bgSurface }}
      >
        {/* Grab handle */}
        <div className="w-12 h-1.5 bg-slate-600/50 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-white text-base">Unit Converter</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none border-b border-white/5">
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Conversion Inputs */}
        <div className="py-4 space-y-4">
          {/* From Unit Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">From</span>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none"
              >
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              value={valueStr}
              onChange={(e) => setValueStr(e.target.value)}
              className="w-full bg-transparent text-right text-3xl font-bold font-mono tracking-tight text-white outline-none"
              placeholder="0"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow-md transition-transform active:scale-90"
              title="Swap units"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* To Unit Card */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">To</span>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none"
              >
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full text-right text-3xl font-bold font-mono tracking-tight overflow-hidden text-ellipsis py-1" style={{ color: theme.accentColor }}>
              {formatConverted(converted)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
