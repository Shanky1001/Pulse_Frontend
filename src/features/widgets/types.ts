import type { ComponentType } from 'react';
import type { Widget, WidgetQuery, WidgetType } from '@/types/dashboard';
import type { NormalizedReport } from '@/types/ga4';

export type RendererProps<TDisplay = unknown> = {
  widget: Widget;
  data?: NormalizedReport;
  display: TDisplay;
  loading: boolean;
  error?: unknown;
};

export type ConfigFormProps<TDisplay = unknown> = {
  widget: Widget;
  display: TDisplay;
  onDisplayChange: (patch: Partial<TDisplay>) => void;
};

export type WidgetDefinition<TDisplay = Record<string, unknown>> = {
  type: WidgetType;
  label: string;
  description: string;
  icon: ComponentType;
  defaultQuery: Omit<WidgetQuery, 'propertyId'>;
  defaultDisplay: TDisplay;
  defaultLayout: { w: number; h: number };
  Renderer: ComponentType<RendererProps<TDisplay>>;
  ConfigForm?: ComponentType<ConfigFormProps<TDisplay>>;
};
