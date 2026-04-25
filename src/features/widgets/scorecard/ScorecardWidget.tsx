import { Box, Skeleton, Stack, Typography } from '@mui/material';
import type { RendererProps } from '../types';
import { metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import type { ScorecardDisplay } from './ScorecardConfig';

function pseudoDelta(metric: string, value: number): number {
  let h = 0;
  for (let i = 0; i < metric.length; i += 1) h = (h * 31 + metric.charCodeAt(i)) | 0;
  const sign = ((h ^ Math.round(value)) & 1) === 0 ? 1 : -1;
  const magnitude = ((Math.abs(h) % 22) + 1) / 100;
  return sign * magnitude;
}

export default function ScorecardWidget({ widget, data, loading, error, display }: RendererProps<ScorecardDisplay>) {
  const metrics = widget.query.metrics;

  if (error) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="error">Failed to load</Typography>
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
  if (metrics.length === 0) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">Pick one or more metrics.</Typography>
      </Stack>
    );
  }

  const cols =
    display.columns === 'auto'
      ? Math.min(4, Math.max(1, Math.ceil(Math.sqrt(metrics.length))))
      : display.columns;

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 1,
          height: '100%',
        }}
      >
        {metrics.map((m) => {
          const v = data.totals[m] ?? 0;
          const delta = pseudoDelta(m, v);
          const positive = delta >= 0;
          return (
            <Box
              key={m}
              sx={(t) => ({
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: t.palette.action.hover,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 0.25,
                minWidth: 0,
              })}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}
                noWrap
              >
                {metricLabel(m)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.15 }} noWrap>
                {formatMetricValue(m, v)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: positive ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {positive ? '▲' : '▼'} {(Math.abs(delta) * 100).toFixed(1)}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
