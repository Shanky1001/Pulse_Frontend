import type { GA4Filter, GA4LeafFilter, GA4MetricDef } from '@/types/ga4';
import { nanoid } from 'nanoid';

export type StringOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'begins_with'
  | 'ends_with'
  | 'in'
  | 'matches_regex'
  | 'is_empty'
  | 'is_not_empty';

export type NumericOperator =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between';

export type FilterRow =
  | {
      kind: 'string';
      id: string;
      fieldName: string;
      operator: StringOperator;
      value: string;
      values?: string[];
    }
  | {
      kind: 'numeric';
      id: string;
      fieldName: string;
      operator: NumericOperator;
      value: number;
      value2?: number;
    };

export type DecodedFilters = {
  rows: FilterRow[];
  join: 'and' | 'or';
  custom: boolean;
};

const STRING_OPERATORS: StringOperator[] = [
  'equals',
  'not_equals',
  'contains',
  'begins_with',
  'ends_with',
  'in',
  'matches_regex',
  'is_empty',
  'is_not_empty',
];

const NUMERIC_OPERATORS: NumericOperator[] = [
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
  'between',
];

export function listStringOperators(): StringOperator[] {
  return STRING_OPERATORS;
}

export function listNumericOperators(): NumericOperator[] {
  return NUMERIC_OPERATORS;
}

export function stringOperatorLabel(op: StringOperator): string {
  switch (op) {
    case 'equals': return 'equals';
    case 'not_equals': return 'does not equal';
    case 'contains': return 'contains';
    case 'begins_with': return 'begins with';
    case 'ends_with': return 'ends with';
    case 'in': return 'is one of';
    case 'matches_regex': return 'matches regex';
    case 'is_empty': return 'is empty';
    case 'is_not_empty': return 'is not empty';
  }
}

export function numericOperatorLabel(op: NumericOperator): string {
  switch (op) {
    case 'eq': return '=';
    case 'neq': return '≠';
    case 'lt': return '<';
    case 'lte': return '≤';
    case 'gt': return '>';
    case 'gte': return '≥';
    case 'between': return 'between';
  }
}

export function newStringRow(fieldName = ''): FilterRow {
  return {
    kind: 'string',
    id: nanoid(8),
    fieldName,
    operator: 'equals',
    value: '',
  };
}

export function newNumericRow(fieldName = ''): FilterRow {
  return {
    kind: 'numeric',
    id: nanoid(8),
    fieldName,
    operator: 'gte',
    value: 0,
  };
}

function isNumericMetric(metric: GA4MetricDef | undefined): boolean {
  return Boolean(metric);
}

function metricNumericKind(metric: GA4MetricDef | undefined): 'int' | 'double' {
  if (!metric) return 'int';
  if (metric.type === 'integer') return 'int';
  return 'double';
}

function buildLeafFromString(row: Extract<FilterRow, { kind: 'string' }>): GA4Filter {
  const leaf: GA4LeafFilter = { fieldName: row.fieldName };
  switch (row.operator) {
    case 'equals':
      leaf.stringFilter = { value: row.value, matchType: 'EXACT' };
      return { filter: leaf };
    case 'not_equals':
      leaf.stringFilter = { value: row.value, matchType: 'EXACT' };
      return { notExpression: { filter: leaf } };
    case 'contains':
      leaf.stringFilter = { value: row.value, matchType: 'CONTAINS' };
      return { filter: leaf };
    case 'begins_with':
      leaf.stringFilter = { value: row.value, matchType: 'BEGINS_WITH' };
      return { filter: leaf };
    case 'ends_with':
      leaf.stringFilter = { value: row.value, matchType: 'ENDS_WITH' };
      return { filter: leaf };
    case 'in': {
      const values = (row.values ?? []).map((v) => v.trim()).filter(Boolean);
      leaf.inListFilter = { values: values.length > 0 ? values : [row.value].filter(Boolean) };
      return { filter: leaf };
    }
    case 'matches_regex':
      leaf.stringFilter = { value: row.value, matchType: 'FULL_REGEXP' };
      return { filter: leaf };
    case 'is_empty':
      leaf.stringFilter = { value: '', matchType: 'EXACT' };
      return { filter: leaf };
    case 'is_not_empty':
      leaf.stringFilter = { value: '', matchType: 'EXACT' };
      return { notExpression: { filter: leaf } };
  }
}

function buildLeafFromNumeric(
  row: Extract<FilterRow, { kind: 'numeric' }>,
  metric: GA4MetricDef | undefined,
): GA4Filter {
  const leaf: GA4LeafFilter = { fieldName: row.fieldName };
  const numericValue =
    metricNumericKind(metric) === 'int'
      ? { int64Value: String(Math.trunc(row.value)) }
      : { doubleValue: row.value };
  const numericValue2 =
    metricNumericKind(metric) === 'int'
      ? { int64Value: String(Math.trunc(row.value2 ?? 0)) }
      : { doubleValue: row.value2 ?? 0 };

  switch (row.operator) {
    case 'eq':
      leaf.numericFilter = { operation: 'EQUAL', value: numericValue };
      return { filter: leaf };
    case 'neq':
      leaf.numericFilter = { operation: 'EQUAL', value: numericValue };
      return { notExpression: { filter: leaf } };
    case 'lt':
      leaf.numericFilter = { operation: 'LESS_THAN', value: numericValue };
      return { filter: leaf };
    case 'lte':
      leaf.numericFilter = { operation: 'LESS_THAN_OR_EQUAL', value: numericValue };
      return { filter: leaf };
    case 'gt':
      leaf.numericFilter = { operation: 'GREATER_THAN', value: numericValue };
      return { filter: leaf };
    case 'gte':
      leaf.numericFilter = { operation: 'GREATER_THAN_OR_EQUAL', value: numericValue };
      return { filter: leaf };
    case 'between':
      leaf.betweenFilter = { fromValue: numericValue, toValue: numericValue2 };
      return { filter: leaf };
  }
}

function isRowComplete(row: FilterRow): boolean {
  if (!row.fieldName) return false;
  if (row.kind === 'string') {
    if (row.operator === 'is_empty' || row.operator === 'is_not_empty') return true;
    if (row.operator === 'in') return Boolean((row.values ?? []).length || row.value);
    return row.value.length > 0;
  }
  if (Number.isNaN(row.value)) return false;
  if (row.operator === 'between') {
    return typeof row.value2 === 'number' && !Number.isNaN(row.value2);
  }
  return true;
}

function joinExpressions(
  expressions: GA4Filter[],
  join: 'and' | 'or',
): GA4Filter | undefined {
  if (expressions.length === 0) return undefined;
  if (expressions.length === 1) return expressions[0];
  if (join === 'and') return { andGroup: { expressions } };
  return { orGroup: { expressions } };
}

export function encodeRows(
  rows: FilterRow[],
  join: 'and' | 'or',
  metricsIndex: Map<string, GA4MetricDef>,
): { dimensionFilter?: GA4Filter; metricFilter?: GA4Filter } {
  const dimRows = rows.filter((r) => isRowComplete(r) && !metricsIndex.has(r.fieldName));
  const metricRows = rows.filter((r) => isRowComplete(r) && metricsIndex.has(r.fieldName));

  const dimensionFilter = joinExpressions(
    dimRows.map((r) =>
      r.kind === 'string'
        ? buildLeafFromString(r)
        : buildLeafFromNumeric(r, metricsIndex.get(r.fieldName)),
    ),
    join,
  );

  const metricFilter = joinExpressions(
    metricRows.map((r) =>
      r.kind === 'numeric'
        ? buildLeafFromNumeric(r, metricsIndex.get(r.fieldName))
        : buildLeafFromString(r),
    ),
    join,
  );

  return {
    ...(dimensionFilter ? { dimensionFilter } : {}),
    ...(metricFilter ? { metricFilter } : {}),
  };
}

function decodeLeaf(leaf: GA4LeafFilter, negated: boolean): FilterRow | null {
  const id = nanoid(8);
  if (leaf.stringFilter) {
    const sf = leaf.stringFilter;
    if (sf.value === '' && sf.matchType === 'EXACT') {
      return {
        kind: 'string',
        id,
        fieldName: leaf.fieldName,
        operator: negated ? 'is_not_empty' : 'is_empty',
        value: '',
      };
    }
    let op: StringOperator;
    switch (sf.matchType ?? 'EXACT') {
      case 'EXACT': op = negated ? 'not_equals' : 'equals'; break;
      case 'CONTAINS': op = 'contains'; break;
      case 'BEGINS_WITH': op = 'begins_with'; break;
      case 'ENDS_WITH': op = 'ends_with'; break;
      case 'FULL_REGEXP':
      case 'PARTIAL_REGEXP': op = 'matches_regex'; break;
      default: op = 'equals';
    }
    return {
      kind: 'string',
      id,
      fieldName: leaf.fieldName,
      operator: op,
      value: sf.value,
    };
  }
  if (leaf.inListFilter) {
    return {
      kind: 'string',
      id,
      fieldName: leaf.fieldName,
      operator: 'in',
      value: '',
      values: [...leaf.inListFilter.values],
    };
  }
  if (leaf.numericFilter) {
    const nv = leaf.numericFilter.value;
    const num =
      'int64Value' in nv ? Number(nv.int64Value) : nv.doubleValue;
    let op: NumericOperator;
    switch (leaf.numericFilter.operation) {
      case 'EQUAL': op = negated ? 'neq' : 'eq'; break;
      case 'LESS_THAN': op = 'lt'; break;
      case 'LESS_THAN_OR_EQUAL': op = 'lte'; break;
      case 'GREATER_THAN': op = 'gt'; break;
      case 'GREATER_THAN_OR_EQUAL': op = 'gte'; break;
    }
    return {
      kind: 'numeric',
      id,
      fieldName: leaf.fieldName,
      operator: op,
      value: num,
    };
  }
  if (leaf.betweenFilter) {
    const from = leaf.betweenFilter.fromValue;
    const to = leaf.betweenFilter.toValue;
    return {
      kind: 'numeric',
      id,
      fieldName: leaf.fieldName,
      operator: 'between',
      value: 'int64Value' in from ? Number(from.int64Value) : from.doubleValue,
      value2: 'int64Value' in to ? Number(to.int64Value) : to.doubleValue,
    };
  }
  return null;
}

function flatten(
  expr: GA4Filter,
  acc: FilterRow[],
  knownJoin: 'and' | 'or' | null,
): { join: 'and' | 'or' | null; ok: boolean } {
  if ('filter' in expr) {
    const row = decodeLeaf(expr.filter, false);
    if (!row) return { join: knownJoin, ok: false };
    acc.push(row);
    return { join: knownJoin, ok: true };
  }
  if ('notExpression' in expr) {
    const inner = expr.notExpression;
    if (!('filter' in inner)) return { join: knownJoin, ok: false };
    const row = decodeLeaf(inner.filter, true);
    if (!row) return { join: knownJoin, ok: false };
    acc.push(row);
    return { join: knownJoin, ok: true };
  }
  if ('andGroup' in expr) {
    if (knownJoin && knownJoin !== 'and') return { join: knownJoin, ok: false };
    let ok = true;
    for (const e of expr.andGroup.expressions) {
      const r = flatten(e, acc, 'and');
      ok = ok && r.ok;
    }
    return { join: 'and', ok };
  }
  if (knownJoin && knownJoin !== 'or') return { join: knownJoin, ok: false };
  let ok = true;
  for (const e of expr.orGroup.expressions) {
    const r = flatten(e, acc, 'or');
    ok = ok && r.ok;
  }
  return { join: 'or', ok };
}

export function decodeFilters(
  dimensionFilter: GA4Filter | undefined,
  metricFilter: GA4Filter | undefined,
): DecodedFilters {
  const rows: FilterRow[] = [];
  let join: 'and' | 'or' = 'and';
  let custom = false;

  for (const expr of [dimensionFilter, metricFilter]) {
    if (!expr) continue;
    const before = rows.length;
    const result = flatten(expr, rows, null);
    if (!result.ok) {
      custom = true;
      rows.length = before;
    } else if (result.join) {
      join = result.join;
    }
  }
  return { rows, join, custom };
}

export function metricsIndexFromCatalog(metrics: GA4MetricDef[]): Map<string, GA4MetricDef> {
  return new Map(metrics.map((m) => [m.apiName, m]));
}

export function isFieldNumeric(
  fieldName: string,
  metricsIndex: Map<string, GA4MetricDef>,
): boolean {
  return isNumericMetric(metricsIndex.get(fieldName));
}
