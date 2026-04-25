import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWidget, updateWidget } from '@/store/slices/editorSlice';
import { useGetCatalogQuery } from '@/store/api/catalogApi';
import type { GA4DateRange, GA4DimensionDef, GA4Filter, GA4MetricDef } from '@/types/ga4';
import type { Widget } from '@/types/dashboard';
import { getWidgetDefinition } from '../widgets/registry';
import FilterEditor from './FilterEditor';

const PRESETS: Array<{ value: string; label: string; range: GA4DateRange }> = [
  { value: 'today', label: 'Today', range: { preset: 'today' } },
  { value: 'last7d', label: 'Last 7 days', range: { preset: 'last7d' } },
  { value: 'last28d', label: 'Last 28 days', range: { preset: 'last28d' } },
  { value: 'last90d', label: 'Last 90 days', range: { preset: 'last90d' } },
  { value: 'custom', label: 'Custom range', range: { start: '', end: '' } },
];

function rangeKey(r: GA4DateRange): string {
  return 'preset' in r ? r.preset : 'custom';
}

export default function ConfigPanel() {
  const dispatch = useAppDispatch();
  const widget = useAppSelector((s) => {
    const id = s.editor.selectedId;
    return id ? s.editor.widgets.find((w) => w.id === id) ?? null : null;
  });
  const propertyId = widget?.query.propertyId ?? '';
  const { data: catalog } = useGetCatalogQuery(propertyId, { skip: !propertyId });

  if (!widget) return null;

  return (
    <Box
      component="aside"
      sx={(t) => ({
        width: { xs: '100%', md: 340 },
        height: '100%',
        flexShrink: 0,
        borderLeft: { xs: 'none', md: '1px solid' },
        borderColor: 'divider',
        bgcolor: t.palette.background.paper,
        overflowY: 'auto',
      })}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Configure widget
        </Typography>
        <Tooltip title="Close">
          <IconButton size="small" onClick={() => dispatch(selectWidget(null))} aria-label="Close panel">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <ConfigPanelBody widget={widget} catalog={catalog} />
    </Box>
  );
}

type BodyProps = {
  widget: Widget;
  catalog?: { metrics: GA4MetricDef[]; dimensions: GA4DimensionDef[] };
};

function ConfigPanelBody({ widget, catalog }: BodyProps) {
  const dispatch = useAppDispatch();
  const def = getWidgetDefinition(widget.type);

  const [title, setTitle] = useState(widget.title);
  useEffect(() => setTitle(widget.title), [widget.id, widget.title]);

  useEffect(() => {
    if (title === widget.title) return;
    const handle = setTimeout(() => {
      dispatch(updateWidget({ id: widget.id, patch: { title } }));
    }, 250);
    return () => clearTimeout(handle);
  }, [title, widget.id, widget.title, dispatch]);

  const metrics = catalog?.metrics ?? [];
  const dimensions = catalog?.dimensions ?? [];

  const metricOptions = useMemo(() => metrics.map((m) => m.apiName), [metrics]);
  const dimensionOptions = useMemo(() => dimensions.map((d) => d.apiName), [dimensions]);
  const metricLabel = (api: string) => metrics.find((m) => m.apiName === api)?.uiName ?? api;
  const dimLabel = (api: string) => dimensions.find((d) => d.apiName === api)?.uiName ?? api;
  const metricCategory = (api: string) => metrics.find((m) => m.apiName === api)?.category ?? '';
  const dimCategory = (api: string) => dimensions.find((d) => d.apiName === api)?.category ?? '';

  const updateQuery = (patch: Partial<Widget['query']>) => {
    dispatch(updateWidget({ id: widget.id, patch: { query: patch } }));
  };

  const onFiltersChange = useCallback(
    (next: { filters: GA4Filter | undefined; metricFilters: GA4Filter | undefined }) => {
      dispatch(
        updateWidget({
          id: widget.id,
          patch: { query: { filters: next.filters, metricFilters: next.metricFilters } },
        }),
      );
    },
    [dispatch, widget.id],
  );

  const onPresetChange = (value: string) => {
    const next = PRESETS.find((p) => p.value === value);
    if (!next) return;
    if (value === 'custom') {
      const today = dayjs().format('YYYY-MM-DD');
      const weekAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      updateQuery({ dateRange: { start: weekAgo, end: today } });
    } else {
      updateQuery({ dateRange: next.range });
    }
  };

  const dateRange = widget.query.dateRange;
  const isCustom = !('preset' in dateRange);
  const customStart: Dayjs | null = isCustom && dateRange.start ? dayjs(dateRange.start) : null;
  const customEnd: Dayjs | null = isCustom && dateRange.end ? dayjs(dateRange.end) : null;

  const onCustomChange = (which: 'start' | 'end', value: Dayjs | null) => {
    if (!isCustom) return;
    const next = {
      ...dateRange,
      [which]: value ? value.format('YYYY-MM-DD') : '',
    } as GA4DateRange;
    updateQuery({ dateRange: next });
  };

  const ConfigForm = def.ConfigForm;

  return (
    <Stack spacing={2.5} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={(t) => ({
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: t.palette.action.hover,
          })}
        >
          <def.icon />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {def.label}
        </Typography>
      </Stack>

      <TextField
        label="Title"
        size="small"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Autocomplete
        multiple
        size="small"
        options={metricOptions}
        value={widget.query.metrics}
        onChange={(_, value) => updateQuery({ metrics: value })}
        getOptionLabel={(api) => metricLabel(api)}
        groupBy={(api) => metricCategory(api)}
        renderTags={(value, getTagProps) =>
          value.map((api, index) => {
            const { key, ...rest } = getTagProps({ index });
            return <Chip key={key} {...rest} size="small" label={metricLabel(api)} />;
          })
        }
        renderInput={(params) => <TextField {...params} label="Metrics" />}
      />

      <Autocomplete
        multiple
        size="small"
        options={dimensionOptions}
        value={widget.query.dimensions}
        onChange={(_, value) => updateQuery({ dimensions: value })}
        getOptionLabel={(api) => dimLabel(api)}
        groupBy={(api) => dimCategory(api)}
        renderTags={(value, getTagProps) =>
          value.map((api, index) => {
            const { key, ...rest } = getTagProps({ index });
            return <Chip key={key} {...rest} size="small" label={dimLabel(api)} />;
          })
        }
        renderInput={(params) => <TextField {...params} label="Dimensions" />}
      />

      <Divider flexItem>
        <Typography variant="caption" color="text.secondary">
          Filters
        </Typography>
      </Divider>

      <FilterEditor
        metrics={metrics}
        dimensions={dimensions}
        propertyId={widget.query.propertyId}
        filters={widget.query.filters}
        metricFilters={widget.query.metricFilters}
        onChange={onFiltersChange}
      />

      <TextField
        select
        label="Date range"
        size="small"
        value={rangeKey(dateRange)}
        onChange={(e) => onPresetChange(e.target.value)}
      >
        {PRESETS.map((p) => (
          <MenuItem key={p.value} value={p.value}>
            {p.label}
          </MenuItem>
        ))}
      </TextField>

      {isCustom ? (
        <Stack direction="row" spacing={1}>
          <DatePicker
            label="Start"
            value={customStart}
            onChange={(v) => onCustomChange('start', v)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <DatePicker
            label="End"
            value={customEnd}
            onChange={(v) => onCustomChange('end', v)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Stack>
      ) : null}

      <TextField
        label="Row limit"
        size="small"
        type="number"
        value={widget.query.limit ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value);
          updateQuery({ limit: v });
        }}
        inputProps={{ min: 1, max: 100000 }}
      />

      {ConfigForm ? (
        <>
          <Divider flexItem>
            <Typography variant="caption" color="text.secondary">
              Display
            </Typography>
          </Divider>
          <ConfigForm
            widget={widget}
            display={widget.display as any}
            onDisplayChange={(patch) =>
              dispatch(updateWidget({ id: widget.id, patch: { display: patch as any } }))
            }
          />
        </>
      ) : null}
    </Stack>
  );
}
