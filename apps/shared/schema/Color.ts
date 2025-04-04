import { Schema } from 'effect';

export type Color = typeof Color.Type;
export const Color = Schema.Literal(
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
);

export type UIColor = typeof UIColor.Type;
export const UIColor = Schema.Literal(
  'clear',
  'muted',
  'primary',
  'secondary',
  'destructive',
  'success',
);

export function getColorHexValues(color: Color): string {
  const colorMap: Record<Color, string> = {
    slate: '#94a3b8',
    gray: '#9ca3af',
    zinc: '#a1a1aa',
    neutral: '#a3a3a3',
    stone: '#a8a29e',
    red: '#f87171',
    orange: '#fb923c',
    amber: '#fbbf24',
    yellow: '#facc15',
    lime: '#a3e635',
    green: '#4ade80',
    emerald: '#34d399',
    teal: '#2dd4bf',
    cyan: '#22d3ee',
    sky: '#38bdf8',
    blue: '#60a5fa',
    indigo: '#818cf8',
    violet: '#a78bfa',
    purple: '#c084fc',
    fuchsia: '#e879f9',
    pink: '#f472b6',
    rose: '#fb7185',
  };

  return colorMap[color];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
