import type { GA4DateRange, GA4MetricDef, NormalizedReport } from '@/types/ga4';
import type { WidgetQuery } from '@/types/dashboard';
import { getMetric } from './ga4Catalog';
import { hashArgs } from './hashArgs';

const COUNTRIES = [
  'United States', 'India', 'United Kingdom', 'Germany', 'Brazil',
  'France', 'Japan', 'Canada', 'Australia', 'Mexico',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Singapore',
];
const CITIES = [
  'New York', 'Bengaluru', 'London', 'Berlin', 'Sao Paulo',
  'Paris', 'Tokyo', 'Toronto', 'Sydney', 'Mexico City',
];
const DEVICE_CATEGORIES = ['mobile', 'desktop', 'tablet'];
const OPERATING_SYSTEMS = ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'ChromeOS'];
const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Samsung Internet', 'Opera'];
const PLATFORMS = ['web', 'iOS', 'Android'];
const PAGE_PATHS = [
  '/', '/pricing', '/features', '/blog', '/blog/announcing-v2',
  '/docs', '/docs/quickstart', '/login', '/signup', '/dashboard',
  '/settings', '/contact', '/about', '/changelog', '/integrations',
];
const PAGE_TITLES = [
  'Home', 'Pricing', 'Features', 'Blog', 'Announcing v2',
  'Docs', 'Quickstart', 'Sign in', 'Sign up', 'Dashboard',
  'Settings', 'Contact', 'About', 'Changelog', 'Integrations',
];
const SCREEN_NAMES = ['Home', 'Feed', 'Profile', 'Settings', 'Search', 'Cart', 'Checkout', 'Onboarding'];
const SOURCES = ['google', '(direct)', 'newsletter', 'twitter', 'github', 'producthunt', 'linkedin'];
const MEDIUMS = ['organic', '(none)', 'email', 'social', 'referral', 'cpc'];
const CAMPAIGNS = ['spring-launch', 'q2-retargeting', 'developer-week', '(not set)', 'partner-feed'];
const EVENT_NAMES = ['page_view', 'session_start', 'first_visit', 'click', 'purchase', 'sign_up', 'login', 'add_to_cart'];
const LANGUAGES = ['en-us', 'en-gb', 'de', 'fr', 'es', 'pt-br', 'ja', 'hi'];
const REGIONS = ['California', 'New York', 'Karnataka', 'England', 'Bavaria', 'Sao Paulo', 'Ile-de-France', 'Tokyo', 'Ontario'];

const DIMENSION_VALUES: Record<string, string[]> = {
  country: COUNTRIES,
  city: CITIES,
  region: REGIONS,
  deviceCategory: DEVICE_CATEGORIES,
  operatingSystem: OPERATING_SYSTEMS,
  browser: BROWSERS,
  platform: PLATFORMS,
  pagePath: PAGE_PATHS,
  pageTitle: PAGE_TITLES,
  screenName: SCREEN_NAMES,
  sessionSource: SOURCES,
  sessionMedium: MEDIUMS,
  sessionCampaignName: CAMPAIGNS,
  eventName: EVENT_NAMES,
  language: LANGUAGES,
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function rand(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TIME_DIMENSIONS = new Set(['date', 'dateHour', 'week', 'month']);

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatYmd(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

function resolveDateRange(range: GA4DateRange): { start: Date; end: Date } {
  if ('preset' in range) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    const start = new Date(today);
    switch (range.preset) {
      case 'today':
        break;
      case 'last7d':
        start.setUTCDate(start.getUTCDate() - 6);
        break;
      case 'last28d':
        start.setUTCDate(start.getUTCDate() - 27);
        break;
      case 'last90d':
        start.setUTCDate(start.getUTCDate() - 89);
        break;
    }
    return { start, end };
  }
  return {
    start: new Date(`${range.start}T00:00:00Z`),
    end: new Date(`${range.end}T00:00:00Z`),
  };
}

function daysBetween(start: Date, end: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    out.push(formatYmd(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

type MetricRange = { min: number; max: number; trend: number };

function metricRange(def: GA4MetricDef | undefined, apiName: string): MetricRange {
  const t = def?.type;
  if (t === 'percent') return { min: 0.2, max: 0.85, trend: 0 };
  if (t === 'currency') return { min: 200, max: 12000, trend: 0.4 };
  if (t === 'seconds') return { min: 30, max: 360, trend: 0 };
  if (t === 'float') return { min: 1.1, max: 4.5, trend: 0 };
  if (apiName === 'activeUsers' || apiName === 'totalUsers') return { min: 800, max: 5200, trend: 0.6 };
  if (apiName === 'newUsers') return { min: 120, max: 1400, trend: 0.4 };
  if (apiName === 'sessions' || apiName === 'engagedSessions') return { min: 1200, max: 7800, trend: 0.5 };
  if (apiName === 'screenPageViews') return { min: 2400, max: 18000, trend: 0.5 };
  if (apiName === 'eventCount') return { min: 8000, max: 60000, trend: 0.6 };
  if (apiName === 'conversions') return { min: 8, max: 220, trend: 0.4 };
  if (apiName === 'transactions') return { min: 4, max: 180, trend: 0.4 };
  return { min: 50, max: 1500, trend: 0.3 };
}

function roundForType(value: number, def: GA4MetricDef | undefined): number {
  const t = def?.type;
  if (t === 'percent') return Math.round(value * 10000) / 10000;
  if (t === 'currency') return Math.round(value * 100) / 100;
  if (t === 'float') return Math.round(value * 100) / 100;
  if (t === 'seconds') return Math.round(value);
  return Math.round(value);
}

function pickValues(rand: () => number, dimension: string, count: number): string[] {
  if (dimension === 'date' || dimension === 'dateHour' || dimension === 'week' || dimension === 'month') {
    return [];
  }
  const pool = DIMENSION_VALUES[dimension] ?? [
    `${dimension}_a`, `${dimension}_b`, `${dimension}_c`, `${dimension}_d`,
  ];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function genMetricValue(rand: () => number, def: GA4MetricDef | undefined, apiName: string, t: number): number {
  const { min, max, trend } = metricRange(def, apiName);
  const noise = rand();
  const trended = (1 - trend) * noise + trend * t;
  const v = min + (max - min) * (0.55 * trended + 0.45 * rand());
  return roundForType(v, def);
}

export function generateReport(args: WidgetQuery): NormalizedReport {
  const seed = seedFromString(hashArgs(args));
  const rand = mulberry32(seed);

  const metrics = args.metrics ?? [];
  const dimensions = args.dimensions ?? [];
  const limit = Math.max(1, Math.min(args.limit ?? 1000, 100000));

  const timeDim = dimensions.find((d) => TIME_DIMENSIONS.has(d));
  const otherDims = dimensions.filter((d) => !TIME_DIMENSIONS.has(d));

  let buckets: Array<Record<string, string>> = [];

  if (timeDim) {
    const { start, end } = resolveDateRange(args.dateRange);
    const dates = daysBetween(start, end);
    if (otherDims.length === 0) {
      buckets = dates.map((d) => ({ [timeDim]: d }));
    } else {
      const primary = otherDims[0];
      const values = pickValues(rand, primary, 5);
      for (const d of dates) {
        for (const v of values) {
          const row: Record<string, string> = { [timeDim]: d, [primary]: v };
          for (const extra of otherDims.slice(1)) {
            row[extra] = pickValues(rand, extra, 1)[0] ?? extra;
          }
          buckets.push(row);
        }
      }
    }
  } else if (otherDims.length === 0) {
    buckets = [{}];
  } else {
    const primary = otherDims[0];
    const values = pickValues(rand, primary, Math.min(limit, 10));
    for (const v of values) {
      const row: Record<string, string> = { [primary]: v };
      for (const extra of otherDims.slice(1)) {
        row[extra] = pickValues(rand, extra, 1)[0] ?? extra;
      }
      buckets.push(row);
    }
  }

  buckets = buckets.slice(0, limit);

  const totals: Record<string, number> = {};
  for (const m of metrics) totals[m] = 0;

  const rows: Array<Record<string, string | number>> = buckets.map((bucket, idx) => {
    const t = buckets.length > 1 ? idx / (buckets.length - 1) : 0.5;
    const row: Record<string, string | number> = { ...bucket };
    for (const m of metrics) {
      const def = getMetric(m);
      const v = genMetricValue(rand, def, m, t);
      row[m] = v;
      totals[m] = (totals[m] ?? 0) + v;
    }
    return row;
  });

  for (const m of metrics) {
    const def = getMetric(m);
    if (def?.type === 'percent' || def?.type === 'float' || def?.type === 'seconds') {
      totals[m] = roundForType(rows.length > 0 ? totals[m] / rows.length : 0, def);
    } else {
      totals[m] = roundForType(totals[m], def);
    }
  }

  return {
    rows,
    totals,
    meta: { rowCount: rows.length },
  };
}
