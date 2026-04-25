import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

import type { GA4DimensionDef, GA4Filter, GA4MetricDef } from '@/types/ga4';
import {
  decodeFilters,
  encodeRows,
  isFieldNumeric,
  listNumericOperators,
  listStringOperators,
  metricsIndexFromCatalog,
  newNumericRow,
  newStringRow,
  numericOperatorLabel,
  stringOperatorLabel,
  type FilterRow,
  type NumericOperator,
  type StringOperator,
} from '@/lib/filterRows';
import { useListEventNamesQuery } from '@/store/api/eventsApi';

type Props = {
  metrics: GA4MetricDef[];
  dimensions: GA4DimensionDef[];
  propertyId: string;
  filters: GA4Filter | undefined;
  metricFilters: GA4Filter | undefined;
  onChange: (next: {
    filters: GA4Filter | undefined;
    metricFilters: GA4Filter | undefined;
  }) => void;
};

type FieldOption = {
  apiName: string;
  uiName: string;
  group: string;
  kind: 'dimension' | 'metric';
  custom: boolean;
};

function buildFieldOptions(
  metrics: GA4MetricDef[],
  dimensions: GA4DimensionDef[],
): FieldOption[] {
  const dims: FieldOption[] = dimensions.map((d) => ({
    apiName: d.apiName,
    uiName: d.uiName,
    group: d.customDefinition ? 'Custom dimensions' : `Dimensions · ${d.category ?? 'Other'}`,
    kind: 'dimension',
    custom: Boolean(d.customDefinition),
  }));
  const mets: FieldOption[] = metrics.map((m) => ({
    apiName: m.apiName,
    uiName: m.uiName,
    group: m.customDefinition ? 'Custom metrics' : `Metrics · ${m.category ?? 'Other'}`,
    kind: 'metric',
    custom: Boolean(m.customDefinition),
  }));
  const all = [...dims, ...mets];
  all.sort((a, b) => {
    if (a.custom !== b.custom) return a.custom ? -1 : 1;
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.uiName.localeCompare(b.uiName);
  });
  return all;
}

function ensureRowKindMatchesField(row: FilterRow, isNumeric: boolean): FilterRow {
  if (isNumeric && row.kind !== 'numeric') {
    return { ...newNumericRow(row.fieldName), id: row.id };
  }
  if (!isNumeric && row.kind !== 'string') {
    return { ...newStringRow(row.fieldName), id: row.id };
  }
  return row;
}

export default function FilterEditor({
  metrics,
  dimensions,
  propertyId,
  filters,
  metricFilters,
  onChange,
}: Props) {
  const fieldOptions = useMemo(
    () => buildFieldOptions(metrics, dimensions),
    [metrics, dimensions],
  );
  const fieldByName = useMemo(() => {
    const m = new Map<string, FieldOption>();
    for (const o of fieldOptions) m.set(o.apiName, o);
    return m;
  }, [fieldOptions]);
  const metricsIndex = useMemo(() => metricsIndexFromCatalog(metrics), [metrics]);

  const decoded = useMemo(
    () => decodeFilters(filters, metricFilters),
    [filters, metricFilters],
  );

  const [rows, setRows] = useState<FilterRow[]>(decoded.rows);
  const [join, setJoin] = useState<'and' | 'or'>(decoded.join);
  const [custom, setCustom] = useState<boolean>(decoded.custom);
  const lastEncoded = useRef<string>('');

  useEffect(() => {
    setRows(decoded.rows);
    setJoin(decoded.join);
    setCustom(decoded.custom);
  }, [decoded]);

  useEffect(() => {
    if (custom) return;
    const encoded = encodeRows(rows, join, metricsIndex);
    const key = JSON.stringify(encoded);
    if (key === lastEncoded.current) return;
    lastEncoded.current = key;
    onChange({
      filters: encoded.dimensionFilter,
      metricFilters: encoded.metricFilter,
    });
  }, [rows, join, metricsIndex, custom, onChange]);

  const { data: eventRows = [], isLoading: loadingEvents } = useListEventNamesQuery(
    propertyId,
    { skip: !propertyId },
  );
  const eventNameOptions = useMemo(() => eventRows.map((r) => r.name), [eventRows]);

  const updateRow = (id: string, patch: Partial<FilterRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, ...patch } as FilterRow;
      }),
    );
  };

  const setRowField = (id: string, fieldName: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const numeric = isFieldNumeric(fieldName, metricsIndex);
        const next = ensureRowKindMatchesField({ ...r, fieldName }, numeric);
        return { ...next, fieldName };
      }),
    );
  };

  const setRowOperator = (id: string, op: StringOperator | NumericOperator) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.kind === 'string') {
          return { ...r, operator: op as StringOperator };
        }
        return { ...r, operator: op as NumericOperator };
      }),
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, newStringRow('eventName')]);
  };

  const addEventQuickFilter = () => {
    const exists = rows.some((r) => r.fieldName === 'eventName' && r.operator === 'in');
    if (exists) return;
    const base = newStringRow('eventName');
    if (base.kind !== 'string') return;
    const eventRow: FilterRow = {
      kind: 'string',
      id: base.id,
      fieldName: 'eventName',
      operator: 'in',
      value: '',
      values: [],
    };
    setRows((prev) => [...prev, eventRow]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const resetCustom = () => {
    setCustom(false);
    setRows([]);
    onChange({ filters: undefined, metricFilters: undefined });
  };

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        {rows.length > 1 ? (
          <ToggleButtonGroup
            size="small"
            value={join}
            exclusive
            onChange={(_, v) => v && setJoin(v)}
            aria-label="Combine filters"
          >
            <ToggleButton value="and" sx={{ px: 1.5, py: 0.25, textTransform: 'none' }}>
              All (AND)
            </ToggleButton>
            <ToggleButton value="or" sx={{ px: 1.5, py: 0.25, textTransform: 'none' }}>
              Any (OR)
            </ToggleButton>
          </ToggleButtonGroup>
        ) : null}
      </Stack>

      {custom ? (
        <Alert
          severity="info"
          action={
            <Button size="small" color="inherit" onClick={resetCustom}>
              Reset
            </Button>
          }
        >
          This widget has an advanced filter that can't be edited row-by-row. Reset to use the
          editor.
        </Alert>
      ) : (
        <>
          {rows.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No filters. The widget shows data for all events, dimensions and metrics.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {rows.map((row, idx) => (
                <FilterRowEditor
                  key={row.id}
                  row={row}
                  fieldOptions={fieldOptions}
                  fieldByName={fieldByName}
                  metricsIndex={metricsIndex}
                  eventNameOptions={eventNameOptions}
                  loadingEvents={loadingEvents}
                  showJoinLabel={idx > 0}
                  join={join}
                  onFieldChange={(name) => setRowField(row.id, name)}
                  onOperatorChange={(op) => setRowOperator(row.id, op)}
                  onPatch={(patch) => updateRow(row.id, patch)}
                  onRemove={() => removeRow(row.id)}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={addRow}
            >
              Add filter
            </Button>
            <Tooltip title="Adds an eventName IN (...) row pre-filled for quick selection">
              <Button
                size="small"
                variant="text"
                startIcon={<StarOutlineRoundedIcon />}
                onClick={addEventQuickFilter}
              >
                Filter by event
              </Button>
            </Tooltip>
          </Stack>
        </>
      )}
    </Stack>
  );
}

type RowProps = {
  row: FilterRow;
  fieldOptions: FieldOption[];
  fieldByName: Map<string, FieldOption>;
  metricsIndex: Map<string, GA4MetricDef>;
  eventNameOptions: string[];
  loadingEvents: boolean;
  showJoinLabel: boolean;
  join: 'and' | 'or';
  onFieldChange: (apiName: string) => void;
  onOperatorChange: (op: StringOperator | NumericOperator) => void;
  onPatch: (patch: Partial<FilterRow>) => void;
  onRemove: () => void;
};

function FilterRowEditor({
  row,
  fieldOptions,
  fieldByName,
  metricsIndex,
  eventNameOptions,
  loadingEvents,
  showJoinLabel,
  join,
  onFieldChange,
  onOperatorChange,
  onPatch,
  onRemove,
}: RowProps) {
  const isNumeric = row.kind === 'numeric';
  const operators = isNumeric ? listNumericOperators() : listStringOperators();
  const opLabel = (op: StringOperator | NumericOperator) =>
    isNumeric
      ? numericOperatorLabel(op as NumericOperator)
      : stringOperatorLabel(op as StringOperator);

  const fieldVal = fieldByName.get(row.fieldName) ?? null;
  const isEventName = row.fieldName === 'eventName';

  return (
    <Box
      sx={(t) => ({
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        bgcolor: t.palette.action.hover,
      })}
    >
      {showJoinLabel ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          {join === 'and' ? 'AND' : 'OR'}
        </Typography>
      ) : null}

      <Stack spacing={1}>
        <Autocomplete
          size="small"
          options={fieldOptions}
          value={fieldVal}
          onChange={(_, v) => v && onFieldChange(v.apiName)}
          getOptionLabel={(o) => o.uiName}
          groupBy={(o) => o.group}
          isOptionEqualToValue={(o, v) => o.apiName === v.apiName}
          renderInput={(params) => <TextField {...params} label="Field" />}
        />

        <Stack direction="row" spacing={1}>
          <TextField
            select
            size="small"
            label="Operator"
            value={row.operator}
            onChange={(e) =>
              onOperatorChange(e.target.value as StringOperator | NumericOperator)
            }
            sx={{ minWidth: 140 }}
          >
            {operators.map((op) => (
              <MenuItem key={op} value={op}>
                {opLabel(op)}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Remove filter">
            <IconButton size="small" onClick={onRemove} aria-label="Remove filter">
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <ValueInput
          row={row}
          isEventName={isEventName}
          eventNameOptions={eventNameOptions}
          loadingEvents={loadingEvents}
          onPatch={onPatch}
          metric={metricsIndex.get(row.fieldName)}
        />
      </Stack>
    </Box>
  );
}

type ValueProps = {
  row: FilterRow;
  isEventName: boolean;
  eventNameOptions: string[];
  loadingEvents: boolean;
  onPatch: (patch: Partial<FilterRow>) => void;
  metric: GA4MetricDef | undefined;
};

function ValueInput({
  row,
  isEventName,
  eventNameOptions,
  loadingEvents,
  onPatch,
  metric,
}: ValueProps) {
  if (row.kind === 'string') {
    if (row.operator === 'is_empty' || row.operator === 'is_not_empty') {
      return (
        <Typography variant="caption" color="text.secondary">
          No value needed.
        </Typography>
      );
    }
    if (row.operator === 'in') {
      const values = row.values ?? [];
      if (isEventName) {
        return (
          <Autocomplete
            multiple
            freeSolo
            size="small"
            options={eventNameOptions}
            value={values}
            onChange={(_, v) =>
              onPatch({ values: (v as string[]).map((s) => s.trim()).filter(Boolean) })
            }
            loading={loadingEvents}
            renderTags={(value, getTagProps) =>
              value.map((name, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} {...rest} size="small" label={name} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Values" placeholder="Pick events" />
            )}
          />
        );
      }
      return (
        <Autocomplete
          multiple
          freeSolo
          size="small"
          options={[]}
          value={values}
          onChange={(_, v) =>
            onPatch({ values: (v as string[]).map((s) => s.trim()).filter(Boolean) })
          }
          renderTags={(value, getTagProps) =>
            value.map((name, index) => {
              const { key, ...rest } = getTagProps({ index });
              return <Chip key={key} {...rest} size="small" label={name} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Values"
              placeholder="Type and press Enter"
              helperText="Add one or more values."
            />
          )}
        />
      );
    }
    if (isEventName && (row.operator === 'equals' || row.operator === 'not_equals')) {
      return (
        <Autocomplete
          freeSolo
          size="small"
          options={eventNameOptions}
          value={row.value}
          onInputChange={(_, v) => onPatch({ value: v ?? '' })}
          loading={loadingEvents}
          renderInput={(params) => (
            <TextField {...params} label="Value" placeholder="event_name" />
          )}
        />
      );
    }
    return (
      <TextField
        size="small"
        label="Value"
        value={row.value}
        onChange={(e) => onPatch({ value: e.target.value })}
        helperText={
          row.operator === 'matches_regex'
            ? 'Anchored full match (RE2 syntax). Example: ^purchase_.+'
            : undefined
        }
      />
    );
  }

  const isInt = (metric?.type ?? 'integer') === 'integer';

  if (row.operator === 'between') {
    return (
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          type="number"
          label="From"
          value={Number.isFinite(row.value) ? row.value : ''}
          onChange={(e) => onPatch({ value: e.target.value === '' ? 0 : Number(e.target.value) })}
          inputProps={isInt ? { step: 1 } : { step: 'any' }}
          fullWidth
        />
        <TextField
          size="small"
          type="number"
          label="To"
          value={typeof row.value2 === 'number' && Number.isFinite(row.value2) ? row.value2 : ''}
          onChange={(e) => onPatch({ value2: e.target.value === '' ? 0 : Number(e.target.value) })}
          inputProps={isInt ? { step: 1 } : { step: 'any' }}
          fullWidth
        />
      </Stack>
    );
  }

  return (
    <TextField
      size="small"
      type="number"
      label="Value"
      value={Number.isFinite(row.value) ? row.value : ''}
      onChange={(e) => onPatch({ value: e.target.value === '' ? 0 : Number(e.target.value) })}
      inputProps={isInt ? { step: 1 } : { step: 'any' }}
    />
  );
}
