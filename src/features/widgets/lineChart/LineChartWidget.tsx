import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RendererProps } from '../types';
import { dimensionLabel, metricLabel } from '@/lib/ga4Catalog';
import { formatDateBucket, formatMetricValue } from '@/lib/format';
import type { LineDisplay } from './LineChartConfig';

const SERIES_COLORS = ['#1f6feb', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#0ea5e9'];

export default function LineChartWidget({ widget, data, loading, error, display }: RendererProps<LineDisplay>) {
  const theme = useTheme();
  const xKey = widget.query.dimensions[0] ?? 'date';
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

  const rows = data.rows.map((r) => ({
    ...r,
    __label: typeof r[xKey] === 'string' ? formatDateBucket(r[xKey] as string) : r[xKey],
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', p: 1.5 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="__label" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} stroke={theme.palette.divider} />
          <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} stroke={theme.palette.divider} width={50} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
            }}
            labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
            formatter={(value: number, name: string) => [formatMetricValue(name, value), metricLabel(name)]}
            labelFormatter={(label) => `${dimensionLabel(xKey)}: ${label}`}
          />
          {metrics.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => metricLabel(v)} /> : null}
          {metrics.map((m, i) => (
            <Line
              key={m}
              type={display.smooth ? 'monotone' : 'linear'}
              dataKey={m}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
