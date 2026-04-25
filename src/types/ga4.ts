export type GA4DateRangeAbsolute = { start: string; end: string };

export type GA4DateRangePreset = {
  preset: 'today' | 'last7d' | 'last28d' | 'last90d';
};

export type GA4DateRange = GA4DateRangeAbsolute | GA4DateRangePreset;

export type GA4MetricDef = {
  apiName: string;
  uiName: string;
  category?: string;
  type?: 'integer' | 'float' | 'percent' | 'currency' | 'seconds';
  customDefinition?: boolean;
  description?: string;
};

export type GA4DimensionDef = {
  apiName: string;
  uiName: string;
  category?: string;
  customDefinition?: boolean;
  description?: string;
};

export type GA4StringFilter = {
  value: string;
  matchType?: 'EXACT' | 'BEGINS_WITH' | 'ENDS_WITH' | 'CONTAINS' | 'FULL_REGEXP' | 'PARTIAL_REGEXP';
  caseSensitive?: boolean;
};

export type GA4InListFilter = {
  values: string[];
  caseSensitive?: boolean;
};

export type GA4NumericValue = { int64Value: string | number } | { doubleValue: number };

export type GA4NumericFilter = {
  operation:
    | 'EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL';
  value: GA4NumericValue;
};

export type GA4LeafFilter = {
  fieldName: string;
  stringFilter?: GA4StringFilter;
  inListFilter?: GA4InListFilter;
  numericFilter?: GA4NumericFilter;
  betweenFilter?: { fromValue: GA4NumericValue; toValue: GA4NumericValue };
};

export type GA4Filter =
  | { filter: GA4LeafFilter }
  | { andGroup: { expressions: GA4Filter[] } }
  | { orGroup: { expressions: GA4Filter[] } }
  | { notExpression: GA4Filter };

export type GA4OrderBy = {
  fieldName: string;
  desc?: boolean;
};

export type NormalizedReport = {
  rows: Array<Record<string, string | number>>;
  totals: Record<string, number>;
  meta: {
    rowCount: number;
    samplingMetadata?: unknown;
  };
};
