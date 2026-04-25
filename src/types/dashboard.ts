import type { GA4DateRange, GA4Filter, GA4OrderBy } from './ga4';

export type WidgetType =
  | 'kpi'
  | 'line'
  | 'bar'
  | 'pie'
  | 'table'
  | 'area'
  | 'funnel'
  | 'geo'
  | 'scorecard'
  | 'gauge';

export type WidgetQuery = {
  propertyId: string;
  metrics: string[];
  dimensions: string[];
  dateRange: GA4DateRange;
  filters?: GA4Filter;
  metricFilters?: GA4Filter;
  orderBys?: GA4OrderBy[];
  limit?: number;
};

export type WidgetLayout = { x: number; y: number; w: number; h: number };

export type Widget = {
  id: string;
  type: WidgetType;
  title: string;
  query: WidgetQuery;
  display: Record<string, unknown>;
  layout: WidgetLayout;
};

export type Dashboard = {
  id: string;
  name: string;
  propertyId: string;
  widgets: Widget[];
  updatedAt: string;
};
