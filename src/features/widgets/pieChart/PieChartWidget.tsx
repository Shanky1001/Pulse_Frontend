import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RendererProps } from '../types';
import { dimensionLabel, metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import type { PieDisplay } from './PieChartConfig';

const COLORS = ['#1f6feb', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#0ea5e9', '#eab308', '#14b8a6', '#94a3b8'];

export default function PieChartWidget({ widget, data, loading, error, display }: RendererProps<PieDisplay>) {
  const theme = useTheme();
  const dimension = widget.query.dimensions[0];
  const metric = widget.query.metrics[0];

  if (error) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="error">Failed to load</Typography>
      </Stack>
    );
  }
  if (loading || !data || !dimension || !metric) {
    return (
      <Box sx={{ p: 2, height: '100%' }}>
        <Skeleton variant="circular" sx={{ width: '60%', height: '60%', mx: 'auto', my: '10%' }} />
      </Box>
    );
  }

  const sorted = [...data.rows].sort(
    (a, b) => Number(b[metric] ?? 0) - Number(a[metric] ?? 0),
  );
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const items = top.map((r) => ({
    name: String(r[dimension]),
    value: Number(r[metric] ?? 0),
  }));
  if (rest.length > 0) {
    items.push({
      name: 'Other',
      value: rest.reduce((acc, r) => acc + Number(r[metric] ?? 0), 0),
    });
  }

  return (
    <Box sx={{ width: '100%', height: '100%', p: 1.5 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
            }}
            formatter={(value: number, name: string) => [
              formatMetricValue(metric, value),
              `${dimensionLabel(dimension)}: ${name}`,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie
            data={items}
            dataKey="value"
            nameKey="name"
            innerRadius={display.donut ? '55%' : 0}
            outerRadius="80%"
            stroke={theme.palette.background.paper}
            strokeWidth={2}
          >
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: -1 }}>
        {metricLabel(metric)} by {dimensionLabel(dimension)}
      </Typography>
    </Box>
  );
}
