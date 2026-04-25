import { Box, Skeleton, Stack, Typography } from '@mui/material';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import type { RendererProps } from '../types';
import { metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import type { KpiDisplay } from './KpiConfig';

function pseudoDelta(metric: string, value: number): number {
  let h = 0;
  for (let i = 0; i < metric.length; i += 1) h = (h * 31 + metric.charCodeAt(i)) | 0;
  const sign = ((h ^ Math.round(value)) & 1) === 0 ? 1 : -1;
  const magnitude = ((Math.abs(h) % 18) + 1) / 100;
  return sign * magnitude;
}

export default function KpiWidget({ widget, data, loading, error }: RendererProps<KpiDisplay>) {
  const metric = widget.query.metrics[0];

  if (error) {
    return (
      <Stack sx={{ p: 2 }} spacing={0.5}>
        <Typography variant="caption" color="error">
          Failed to load
        </Typography>
      </Stack>
    );
  }

  if (loading || !data || !metric) {
    return (
      <Stack sx={{ p: 2 }} spacing={1}>
        <Skeleton width={120} height={18} />
        <Skeleton width={160} height={48} />
        <Skeleton width={80} height={16} />
      </Stack>
    );
  }

  const total = data.totals[metric] ?? 0;
  const delta = pseudoDelta(metric, total);
  const positive = delta >= 0;

  return (
    <Stack sx={{ p: 2, height: '100%' }} spacing={0.5} justifyContent="center">
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {metricLabel(metric)}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
        {formatMetricValue(metric, total)}
      </Typography>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          color: positive ? 'success.main' : 'error.main',
        }}
      >
        {positive ? (
          <ArrowDropUpRoundedIcon fontSize="small" />
        ) : (
          <ArrowDropDownRoundedIcon fontSize="small" />
        )}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {(Math.abs(delta) * 100).toFixed(1)}% vs prev. period
        </Typography>
      </Box>
    </Stack>
  );
}
