import { getMetric } from './ga4Catalog';

export function formatMetricValue(metric: string, value: number | string): string {
  const def = getMetric(metric);
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  switch (def?.type) {
    case 'percent':
      return `${(num * 100).toFixed(1)}%`;
    case 'currency':
      return num.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });
    case 'seconds':
      return formatDuration(num);
    case 'float':
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    default:
      return num.toLocaleString();
  }
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatDateBucket(value: string): string {
  if (/^\d{8}$/.test(value)) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (/^\d{10}$/.test(value)) {
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    const h = value.slice(8, 10);
    return `${m}/${d} ${h}:00`;
  }
  return value;
}
