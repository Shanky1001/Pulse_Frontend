import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import StackedLineChartRoundedIcon from '@mui/icons-material/StackedLineChartRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';

import type { WidgetType } from '@/types/dashboard';
import type { WidgetDefinition } from './types';

import KpiWidget from './kpi/KpiWidget';
import KpiConfig, { kpiDefaultDisplay } from './kpi/KpiConfig';
import LineChartWidget from './lineChart/LineChartWidget';
import LineChartConfig, { lineDefaultDisplay } from './lineChart/LineChartConfig';
import BarChartWidget from './barChart/BarChartWidget';
import BarChartConfig, { barDefaultDisplay } from './barChart/BarChartConfig';
import PieChartWidget from './pieChart/PieChartWidget';
import PieChartConfig, { pieDefaultDisplay } from './pieChart/PieChartConfig';
import TableWidget from './table/TableWidget';
import TableConfig, { tableDefaultDisplay } from './table/TableConfig';
import AreaWidget from './area/AreaWidget';
import AreaConfig, { areaDefaultDisplay } from './area/AreaConfig';
import FunnelWidget from './funnel/FunnelWidget';
import FunnelConfig, { funnelDefaultDisplay } from './funnel/FunnelConfig';
import GeoWidget from './geo/GeoWidget';
import GeoConfig, { geoDefaultDisplay } from './geo/GeoConfig';
import ScorecardWidget from './scorecard/ScorecardWidget';
import ScorecardConfig, { scorecardDefaultDisplay } from './scorecard/ScorecardConfig';
import GaugeWidget from './gauge/GaugeWidget';
import GaugeConfig, { gaugeDefaultDisplay } from './gauge/GaugeConfig';

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition<any>> = {
  kpi: {
    type: 'kpi',
    label: 'KPI',
    description: 'A single big number with delta vs previous period.',
    icon: SpeedRoundedIcon,
    defaultQuery: {
      metrics: ['activeUsers'],
      dimensions: [],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: kpiDefaultDisplay,
    defaultLayout: { w: 3, h: 2 },
    Renderer: KpiWidget,
    ConfigForm: KpiConfig,
  },
  scorecard: {
    type: 'scorecard',
    label: 'Scorecard',
    description: 'Multiple KPIs in a compact grid (one widget, many metrics).',
    icon: DashboardRoundedIcon,
    defaultQuery: {
      metrics: ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate'],
      dimensions: [],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: scorecardDefaultDisplay,
    defaultLayout: { w: 6, h: 3 },
    Renderer: ScorecardWidget,
    ConfigForm: ScorecardConfig,
  },
  gauge: {
    type: 'gauge',
    label: 'Gauge',
    description: 'Progress of a single metric against a configurable target.',
    icon: DonutLargeRoundedIcon,
    defaultQuery: {
      metrics: ['conversions'],
      dimensions: [],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: gaugeDefaultDisplay,
    defaultLayout: { w: 3, h: 4 },
    Renderer: GaugeWidget,
    ConfigForm: GaugeConfig,
  },
  line: {
    type: 'line',
    label: 'Line chart',
    description: 'Trend over time for one or more metrics.',
    icon: ShowChartRoundedIcon,
    defaultQuery: {
      metrics: ['activeUsers'],
      dimensions: ['date'],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: lineDefaultDisplay,
    defaultLayout: { w: 6, h: 4 },
    Renderer: LineChartWidget,
    ConfigForm: LineChartConfig,
  },
  area: {
    type: 'area',
    label: 'Area chart',
    description: 'Filled trend over time, optionally stacked across metrics.',
    icon: StackedLineChartRoundedIcon,
    defaultQuery: {
      metrics: ['activeUsers', 'newUsers'],
      dimensions: ['date'],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: areaDefaultDisplay,
    defaultLayout: { w: 6, h: 4 },
    Renderer: AreaWidget,
    ConfigForm: AreaConfig,
  },
  bar: {
    type: 'bar',
    label: 'Bar chart',
    description: 'Compare a metric across the values of a dimension.',
    icon: BarChartRoundedIcon,
    defaultQuery: {
      metrics: ['sessions'],
      dimensions: ['country'],
      dateRange: { preset: 'last28d' },
      limit: 10,
    },
    defaultDisplay: barDefaultDisplay,
    defaultLayout: { w: 6, h: 4 },
    Renderer: BarChartWidget,
    ConfigForm: BarChartConfig,
  },
  pie: {
    type: 'pie',
    label: 'Pie chart',
    description: 'Share of a metric by dimension (top 8 + Other).',
    icon: PieChartRoundedIcon,
    defaultQuery: {
      metrics: ['sessions'],
      dimensions: ['deviceCategory'],
      dateRange: { preset: 'last28d' },
    },
    defaultDisplay: pieDefaultDisplay,
    defaultLayout: { w: 4, h: 4 },
    Renderer: PieChartWidget,
    ConfigForm: PieChartConfig,
  },
  funnel: {
    type: 'funnel',
    label: 'Funnel',
    description: 'Stage-by-stage drop-off for an event sequence.',
    icon: FilterAltRoundedIcon,
    defaultQuery: {
      metrics: ['eventCount'],
      dimensions: ['eventName'],
      dateRange: { preset: 'last28d' },
      limit: 8,
    },
    defaultDisplay: funnelDefaultDisplay,
    defaultLayout: { w: 5, h: 4 },
    Renderer: FunnelWidget,
    ConfigForm: FunnelConfig,
  },
  geo: {
    type: 'geo',
    label: 'Geo (regions)',
    description: 'Top regions ranked by a metric, with country flags.',
    icon: PublicRoundedIcon,
    defaultQuery: {
      metrics: ['activeUsers'],
      dimensions: ['country'],
      dateRange: { preset: 'last28d' },
      limit: 15,
    },
    defaultDisplay: geoDefaultDisplay,
    defaultLayout: { w: 5, h: 5 },
    Renderer: GeoWidget,
    ConfigForm: GeoConfig,
  },
  table: {
    type: 'table',
    label: 'Table',
    description: 'Tabular breakdown by one or more dimensions.',
    icon: TableChartRoundedIcon,
    defaultQuery: {
      metrics: ['screenPageViews', 'engagementRate'],
      dimensions: ['pagePath'],
      dateRange: { preset: 'last28d' },
      limit: 10,
    },
    defaultDisplay: tableDefaultDisplay,
    defaultLayout: { w: 12, h: 5 },
    Renderer: TableWidget,
    ConfigForm: TableConfig,
  },
};

export const WIDGET_TYPES: WidgetType[] = [
  'kpi',
  'scorecard',
  'gauge',
  'line',
  'area',
  'bar',
  'pie',
  'funnel',
  'geo',
  'table',
];

export function getWidgetDefinition(type: WidgetType): WidgetDefinition<any> {
  return WIDGET_REGISTRY[type];
}
