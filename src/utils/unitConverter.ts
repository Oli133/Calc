import { UnitCategory, UnitDefinition } from '../types/calculator';

export const UNIT_CATEGORIES: { id: UnitCategory; label: string }[] = [
  { id: 'length', label: 'Length' },
  { id: 'mass', label: 'Mass & Weight' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'area', label: 'Area' },
  { id: 'volume', label: 'Volume' },
  { id: 'speed', label: 'Speed' },
  { id: 'storage', label: 'Digital Storage' },
];

export const UNITS_BY_CATEGORY: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: 'm', name: 'Meter', symbol: 'm', ratioToBase: 1 },
    { id: 'km', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
    { id: 'cm', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
    { id: 'mm', name: 'Millimeter', symbol: 'mm', ratioToBase: 0.001 },
    { id: 'in', name: 'Inch', symbol: 'in', ratioToBase: 0.0254 },
    { id: 'ft', name: 'Foot', symbol: 'ft', ratioToBase: 0.3048 },
    { id: 'yd', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
    { id: 'mi', name: 'Mile', symbol: 'mi', ratioToBase: 1609.344 },
  ],
  mass: [
    { id: 'kg', name: 'Kilogram', symbol: 'kg', ratioToBase: 1 },
    { id: 'g', name: 'Gram', symbol: 'g', ratioToBase: 0.001 },
    { id: 'mg', name: 'Milligram', symbol: 'mg', ratioToBase: 0.000001 },
    { id: 'lb', name: 'Pound', symbol: 'lb', ratioToBase: 0.45359237 },
    { id: 'oz', name: 'Ounce', symbol: 'oz', ratioToBase: 0.02834952 },
    { id: 't', name: 'Metric Ton', symbol: 't', ratioToBase: 1000 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', ratioToBase: 1, offset: 0 },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', ratioToBase: 5 / 9, offset: 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', ratioToBase: 1, offset: 273.15 },
  ],
  area: [
    { id: 'sq_m', name: 'Square Meter', symbol: 'm²', ratioToBase: 1 },
    { id: 'sq_km', name: 'Square Kilometer', symbol: 'km²', ratioToBase: 1000000 },
    { id: 'sq_ft', name: 'Square Foot', symbol: 'ft²', ratioToBase: 0.092903 },
    { id: 'sq_yd', name: 'Square Yard', symbol: 'yd²', ratioToBase: 0.836127 },
    { id: 'acre', name: 'Acre', symbol: 'ac', ratioToBase: 4046.856422 },
    { id: 'hectare', name: 'Hectare', symbol: 'ha', ratioToBase: 10000 },
  ],
  volume: [
    { id: 'l', name: 'Liter', symbol: 'L', ratioToBase: 1 },
    { id: 'ml', name: 'Milliliter', symbol: 'mL', ratioToBase: 0.001 },
    { id: 'm3', name: 'Cubic Meter', symbol: 'm³', ratioToBase: 1000 },
    { id: 'gal_us', name: 'Gallon (US)', symbol: 'gal', ratioToBase: 3.78541 },
    { id: 'fl_oz_us', name: 'Fluid Ounce (US)', symbol: 'fl oz', ratioToBase: 0.0295735 },
    { id: 'cup_us', name: 'Cup (US)', symbol: 'cup', ratioToBase: 0.236588 },
  ],
  speed: [
    { id: 'mps', name: 'Meters per second', symbol: 'm/s', ratioToBase: 1 },
    { id: 'kph', name: 'Kilometers per hour', symbol: 'km/h', ratioToBase: 1 / 3.6 },
    { id: 'mph', name: 'Miles per hour', symbol: 'mph', ratioToBase: 0.44704 },
    { id: 'knot', name: 'Knot', symbol: 'kn', ratioToBase: 0.514444 },
  ],
  storage: [
    { id: 'b', name: 'Byte', symbol: 'B', ratioToBase: 1 },
    { id: 'kb', name: 'Kilobyte', symbol: 'KB', ratioToBase: 1024 },
    { id: 'mb', name: 'Megabyte', symbol: 'MB', ratioToBase: 1024 * 1024 },
    { id: 'gb', name: 'Gigabyte', symbol: 'GB', ratioToBase: 1024 * 1024 * 1024 },
    { id: 'tb', name: 'Terabyte', symbol: 'TB', ratioToBase: 1024 * 1024 * 1024 * 1024 },
  ],
};

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  const units = UNITS_BY_CATEGORY[category];
  const from = units.find((u) => u.id === fromUnitId);
  const to = units.find((u) => u.id === toUnitId);

  if (!from || !to) return 0;

  if (category === 'temperature') {
    // Temperature special offset conversion
    let inCelsius: number;
    if (from.id === 'c') inCelsius = value;
    else if (from.id === 'f') inCelsius = (value - 32) * (5 / 9);
    else if (from.id === 'k') inCelsius = value - 273.15;
    else inCelsius = value;

    if (to.id === 'c') return inCelsius;
    if (to.id === 'f') return inCelsius * (9 / 5) + 32;
    if (to.id === 'k') return inCelsius + 273.15;
    return inCelsius;
  }

  // Linear conversion
  const baseValue = value * from.ratioToBase;
  return baseValue / to.ratioToBase;
}
