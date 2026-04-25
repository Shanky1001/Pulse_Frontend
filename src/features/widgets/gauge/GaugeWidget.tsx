import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts';
import type { RendererProps } from '../types';
import { metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import type { GaugeDisplay } from './GaugeConfig';

export default function GaugeWidget({ widget, data, loading, error, display }: RendererProps<GaugeDisplay>) {
  const theme = useTheme();
  const metric = widget.query.metrics[0];
  const target = Math.max(1, display.target ?? 1);

  if (error) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="error">Failed to load</Typography>
      </Stack>
    );
  }
  if (!metric) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">Pick a metric.</Typography>
      </Stack>
    );
  }
  if (loading || !data) {
    return (
      <Box sx={{ p: 2, height: '100%' }}>
        <Skeleton variant="circular" sx={{ width: 140, height: 140, mx: 'auto', my: 2 }} />
      </Box>
    );
  }

  const value = data.totals[metric] ?? 0;
  const pct = Math.min(1, value / target);
  const pctDisplay = pct * 100;

  const color =
    pct >= 1 ? theme.palette.success.main : pct >= 0.6 ? theme.palette.primary.main : theme.palette.warning.main;

  const chartData = [{ name: metric, value: pctDisplay, fill: color }];

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={chartData}
            startAngle={210}
            endAngle={-30}
            barSize={14}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: theme.palette.action.hover }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {formatMetricValue(metric, value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {pctDisplay.toFixed(0)}% of {formatMetricValue(metric, target)}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6, pb: 1 }}
      >
        {metricLabel(metric)}
      </Typography>
    </Box>
  );
}
