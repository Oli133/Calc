export type AngleMode = 'DEG' | 'RAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type ThemeId = 'charcoal' | 'coral' | 'sage' | 'ocean' | 'lavender' | 'amoled';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  bgSurface: string;
  phoneBody: string;
  primaryKeyBg: string;
  primaryKeyText: string;
  numKeyBg: string;
  numKeyText: string;
  actionKeyBg: string;
  actionKeyText: string;
  equalKeyBg: string;
  equalKeyText: string;
  accentColor: string;
  displayBg: string;
}

export type UnitCategory = 
  | 'length' 
  | 'mass' 
  | 'temperature' 
  | 'area' 
  | 'volume' 
  | 'speed' 
  | 'storage';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // For linear conversion
  offset?: number;     // For temperature (e.g. Celsius / Fahrenheit)
}

export interface BuildStep {
  id: string;
  number: number;
  tool: string;
  name: string;
  description: string;
  command: string;
  inputFiles: string[];
  outputFiles: string[];
  expectedOutput: string;
}
