import type { Dashboard, Widget } from '@/types/dashboard';
import { kpiDefaultDisplay } from '@/features/widgets/kpi/KpiConfig';
import { lineDefaultDisplay } from '@/features/widgets/lineChart/LineChartConfig';
import { areaDefaultDisplay } from '@/features/widgets/area/AreaConfig';
import { barDefaultDisplay } from '@/features/widgets/barChart/BarChartConfig';
import { pieDefaultDisplay } from '@/features/widgets/pieChart/PieChartConfig';
import { tableDefaultDisplay } from '@/features/widgets/table/TableConfig';
import { funnelDefaultDisplay } from '@/features/widgets/funnel/FunnelConfig';
import { geoDefaultDisplay } from '@/features/widgets/geo/GeoConfig';
import { scorecardDefaultDisplay } from '@/features/widgets/scorecard/ScorecardConfig';
import { gaugeDefaultDisplay } from '@/features/widgets/gauge/GaugeConfig';

export function dashboardIdForProperty(propertyId: string): string {
  return `dashboard:${propertyId}`;
}

export function buildDefaultDashboard(propertyId: string): Dashboard {
  const widgets: Widget[] = [
    {
      id: 'w_scorecard',
      type: 'scorecard',
      title: 'Headline metrics',
      query: {
        propertyId,
        metrics: ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate'],
        dimensions: [],
        dateRange: { preset: 'last28d' },
      },
      display: { ...scorecardDefaultDisplay },
      layout: { x: 0, y: 0, w: 9, h: 3 },
    },
    {
      id: 'w_gauge_conversions',
      type: 'gauge',
      title: 'Conversions vs target',
      query: {
        propertyId,
        metrics: ['conversions'],
        dimensions: [],
        dateRange: { preset: 'last28d' },
      },
      display: { ...gaugeDefaultDisplay, target: 1500 },
      layout: { x: 9, y: 0, w: 3, h: 3 },
    },
    {
      id: 'w_users_over_time',
      type: 'area',
      title: 'Users over time',
      query: {
        propertyId,
        metrics: ['activeUsers', 'newUsers'],
        dimensions: ['date'],
        dateRange: { preset: 'last28d' },
      },
      display: { ...areaDefaultDisplay, stacked: false },
      layout: { x: 0, y: 3, w: 7, h: 4 },
    },
    {
      id: 'w_devices',
      type: 'pie',
      title: 'Sessions by device',
      query: {
        propertyId,
        metrics: ['sessions'],
        dimensions: ['deviceCategory'],
        dateRange: { preset: 'last28d' },
      },
      display: { ...pieDefaultDisplay },
      layout: { x: 7, y: 3, w: 5, h: 4 },
    },
    {
      id: 'w_geo',
      type: 'geo',
      title: 'Top countries by users',
      query: {
        propertyId,
        metrics: ['activeUsers'],
        dimensions: ['country'],
        dateRange: { preset: 'last28d' },
        limit: 15,
      },
      display: { ...geoDefaultDisplay, topN: 8 },
      layout: { x: 0, y: 7, w: 5, h: 5 },
    },
    {
      id: 'w_funnel',
      type: 'funnel',
      title: 'Event funnel',
      query: {
        propertyId,
        metrics: ['eventCount'],
        dimensions: ['eventName'],
        dateRange: { preset: 'last28d' },
        limit: 8,
      },
      display: { ...funnelDefaultDisplay },
      layout: { x: 5, y: 7, w: 4, h: 5 },
    },
    {
      id: 'w_revenue_kpi',
      type: 'kpi',
      title: 'Total revenue',
      query: {
        propertyId,
        metrics: ['totalRevenue'],
        dimensions: [],
        dateRange: { preset: 'last28d' },
      },
      display: { ...kpiDefaultDisplay },
      layout: { x: 9, y: 7, w: 3, h: 2 },
    },
    {
      id: 'w_revenue_trend',
      type: 'line',
      title: 'Revenue trend',
      query: {
        propertyId,
        metrics: ['totalRevenue'],
        dimensions: ['date'],
        dateRange: { preset: 'last28d' },
      },
      display: { ...lineDefaultDisplay, smooth: true },
      layout: { x: 9, y: 9, w: 3, h: 3 },
    },
    {
      id: 'w_top_countries_bar',
      type: 'bar',
      title: 'Sessions by country',
      query: {
        propertyId,
        metrics: ['sessions'],
        dimensions: ['country'],
        dateRange: { preset: 'last28d' },
        limit: 10,
      },
      display: { ...barDefaultDisplay, orientation: 'horizontal' },
      layout: { x: 0, y: 12, w: 6, h: 4 },
    },
    {
      id: 'w_top_pages',
      type: 'table',
      title: 'Top pages',
      query: {
        propertyId,
        metrics: ['screenPageViews', 'engagementRate'],
        dimensions: ['pagePath'],
        dateRange: { preset: 'last28d' },
        limit: 25,
      },
      display: { ...tableDefaultDisplay },
      layout: { x: 6, y: 12, w: 6, h: 4 },
    },
  ];

  return {
    id: dashboardIdForProperty(propertyId),
    name: 'My GA4 dashboard',
    propertyId,
    widgets,
    updatedAt: new Date().toISOString(),
  };
}
