export function minMax(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

/**
 * Formate un nombre de bytes en une chaîne lisible (KB, MB, GB, etc.)
 */
export function formatBytes(bytes: number, forceDecimals: boolean = true): string {
  if (!bytes || bytes <= 0 || isNaN(bytes))
    return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const unit = sizes[i] || sizes[0];
  const formatted = forceDecimals ? value.toFixed(2) : value.toFixed(0);
  return formatted + ' ' + unit;
}

/**
 * Formate un débit en bytes par seconde en une chaîne lisible
 */
export function formatBytesPerSec(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0 || isNaN(bytesPerSec))
    return '0 B/s';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
  const value = bytesPerSec / Math.pow(k, i);
  // Pas de décimales pour B/s, 2 décimales pour le reste
  const unit = sizes[i] || sizes[0];
  const formatted = unit === 'B' ? value.toFixed(0) : value.toFixed(2);
  return formatted + ' ' + unit + '/s';
}

export function formatPercentage(percent: number, cores: number = 1, forceDecimals: boolean = true): string {
  percent = minMax(percent * 100, 0, cores * 100);
  return `${percent.toFixed(forceDecimals ? 2 : 0)} %`;
}