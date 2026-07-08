/** Apple-style ring track: domain color at ~22% opacity */
export function ringTrack(color: string, isDark: boolean): string {
  return isDark ? `${color}38` : `${color}2E`;
}

export function tintSurface(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
