import type { GA4DimensionDef, GA4MetricDef } from '@/types/ga4';

export const METRICS: GA4MetricDef[] = [
  { apiName: 'activeUsers', uiName: 'Active users', category: 'User', type: 'integer' },
  { apiName: 'newUsers', uiName: 'New users', category: 'User', type: 'integer' },
  { apiName: 'totalUsers', uiName: 'Total users', category: 'User', type: 'integer' },
  { apiName: 'sessions', uiName: 'Sessions', category: 'Session', type: 'integer' },
  { apiName: 'engagedSessions', uiName: 'Engaged sessions', category: 'Session', type: 'integer' },
  { apiName: 'sessionsPerUser', uiName: 'Sessions per user', category: 'Session', type: 'float' },
  { apiName: 'averageSessionDuration', uiName: 'Avg. session duration', category: 'Session', type: 'seconds' },
  { apiName: 'engagementRate', uiName: 'Engagement rate', category: 'Engagement', type: 'percent' },
  { apiName: 'bounceRate', uiName: 'Bounce rate', category: 'Engagement', type: 'percent' },
  { apiName: 'screenPageViews', uiName: 'Views', category: 'Page / screen', type: 'integer' },
  { apiName: 'screenPageViewsPerSession', uiName: 'Views per session', category: 'Page / screen', type: 'float' },
  { apiName: 'eventCount', uiName: 'Event count', category: 'Event', type: 'integer' },
  { apiName: 'conversions', uiName: 'Conversions', category: 'Event', type: 'integer' },
  { apiName: 'totalRevenue', uiName: 'Total revenue', category: 'Revenue', type: 'currency' },
  { apiName: 'purchaseRevenue', uiName: 'Purchase revenue', category: 'Revenue', type: 'currency' },
  { apiName: 'transactions', uiName: 'Transactions', category: 'Revenue', type: 'integer' },
  { apiName: 'averagePurchaseRevenue', uiName: 'Avg. purchase revenue', category: 'Revenue', type: 'currency' },
  { apiName: 'crashFreeUsersRate', uiName: 'Crash-free users rate', category: 'App stability', type: 'percent' },
];

export const DIMENSIONS: GA4DimensionDef[] = [
  { apiName: 'date', uiName: 'Date', category: 'Time' },
  { apiName: 'dateHour', uiName: 'Date + hour', category: 'Time' },
  { apiName: 'week', uiName: 'Week', category: 'Time' },
  { apiName: 'month', uiName: 'Month', category: 'Time' },
  { apiName: 'country', uiName: 'Country', category: 'Geography' },
  { apiName: 'city', uiName: 'City', category: 'Geography' },
  { apiName: 'region', uiName: 'Region', category: 'Geography' },
  { apiName: 'deviceCategory', uiName: 'Device category', category: 'Platform / device' },
  { apiName: 'operatingSystem', uiName: 'Operating system', category: 'Platform / device' },
  { apiName: 'browser', uiName: 'Browser', category: 'Platform / device' },
  { apiName: 'platform', uiName: 'Platform', category: 'Platform / device' },
  { apiName: 'pagePath', uiName: 'Page path', category: 'Page / screen' },
  { apiName: 'pageTitle', uiName: 'Page title', category: 'Page / screen' },
  { apiName: 'screenName', uiName: 'Screen name', category: 'Page / screen' },
  { apiName: 'sessionSource', uiName: 'Session source', category: 'Acquisition' },
  { apiName: 'sessionMedium', uiName: 'Session medium', category: 'Acquisition' },
  { apiName: 'sessionCampaignName', uiName: 'Campaign name', category: 'Acquisition' },
  { apiName: 'eventName', uiName: 'Event name', category: 'Event' },
  { apiName: 'language', uiName: 'Language', category: 'User' },
];

const METRIC_INDEX = new Map(METRICS.map((m) => [m.apiName, m]));
const DIMENSION_INDEX = new Map(DIMENSIONS.map((d) => [d.apiName, d]));

export function getMetric(apiName: string): GA4MetricDef | undefined {
  return METRIC_INDEX.get(apiName);
}

export function getDimension(apiName: string): GA4DimensionDef | undefined {
  return DIMENSION_INDEX.get(apiName);
}

export function metricLabel(apiName: string): string {
  return getMetric(apiName)?.uiName ?? apiName;
}

export function dimensionLabel(apiName: string): string {
  return getDimension(apiName)?.uiName ?? apiName;
}
