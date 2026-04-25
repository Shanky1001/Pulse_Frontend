import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import type { RendererProps } from '../types';
import { dimensionLabel, metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import type { FunnelDisplay } from './FunnelConfig';

const STAGE_COLORS = ['#1f6feb', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#eab308'];

export default function FunnelWidget({ widget, data, loading, error, display }: RendererProps<FunnelDisplay>) {
  const theme = useTheme();
  const dim = widget.query.dimensions[0];
  const metric = widget.query.metrics[0];

  if (error) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="error">Failed to load</Typography>
      </Stack>
    );
  }
  if (!dim || !metric) {
    return (
      <Stack sx={{ p: 2 }} spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Pick a metric and a stage dimension (e.g. Event name) to render the funnel.
        </Typography>
      </Stack>
    );
  }
  if (loading || !data) {
    return (
      <Box sx={{ p: 2, height: '100%' }}>
        <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%', borderRadius: 1 }} />
      </Box>
    );
  }

  const stages = data.rows
    .map((r) => ({ name: String(r[dim] ?? ''), value: Number(r[metric] ?? 0) }))
    .filter((s) => s.name && s.value > 0)
    .sort((a, b) => b.value - a.value);

  if (stages.length === 0) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">No stage data.</Typography>
      </Stack>
    );
  }

  const top = stages[0].value;

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
      <Stack spacing={1}>
        {stages.map((s, i) => {
          const widthPct = (s.value / top) * 100;
          const prev = i > 0 ? stages[i - 1].value : null;
          const dropoff = prev !== null && prev > 0 ? 1 - s.value / prev : null;
          const color = STAGE_COLORS[i % STAGE_COLORS.length];
          return (
            <Box key={`${s.name}-${i}`}>
              <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {i + 1}. {s.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {formatMetricValue(metric, s.value)}
                  </Typography>
                  {display.showDropoff && dropoff !== null ? (
                    <Typography
                      variant="caption"
                      sx={{ color: dropoff > 0 ? 'error.light' : 'success.main', fontWeight: 600 }}
                    >
                      {dropoff > 0 ? '−' : '+'}
                      {Math.abs(dropoff * 100).toFixed(1)}%
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
              <Box
                sx={{
                  position: 'relative',
                  height: 22,
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: `${widthPct}%`,
                    bgcolor: color,
                    transition: 'width 240ms ease',
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Stages by {dimensionLabel(dim)} · sorted by {metricLabel(metric)}
      </Typography>
    </Box>
  );
}
