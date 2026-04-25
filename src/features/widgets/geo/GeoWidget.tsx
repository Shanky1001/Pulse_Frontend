import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import type { RendererProps } from '../types';
import { dimensionLabel, metricLabel } from '@/lib/ga4Catalog';
import { formatMetricValue } from '@/lib/format';
import { flagEmoji } from '@/lib/countryFlag';
import type { GeoDisplay } from './GeoConfig';

export default function GeoWidget({ widget, data, loading, error, display }: RendererProps<GeoDisplay>) {
  const theme = useTheme();
  const dim = widget.query.dimensions[0] ?? 'country';
  const metric = widget.query.metrics[0];

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
        <Typography variant="caption" color="text.secondary">
          Pick a metric to render the regional breakdown.
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

  const isCountry = dim === 'country';

  const items = data.rows
    .map((r) => ({ name: String(r[dim] ?? '—'), value: Number(r[metric] ?? 0) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, Math.max(1, display.topN ?? 10));

  if (items.length === 0) {
    return (
      <Stack sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">No regional data.</Typography>
      </Stack>
    );
  }

  const top = items[0].value;
  const total = items.reduce((acc, x) => acc + x.value, 0);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
      <Stack spacing={1}>
        {items.map((row, i) => {
          const widthPct = (row.value / top) * 100;
          const sharePct = total > 0 ? (row.value / total) * 100 : 0;
          return (
            <Box key={`${row.name}-${i}`}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontSize: 18, lineHeight: 1, width: 22, textAlign: 'center' }}
                >
                  {isCountry ? flagEmoji(row.name) : '📍'}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                  {row.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {formatMetricValue(metric, row.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 48, textAlign: 'right' }}>
                  {sharePct.toFixed(1)}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  position: 'relative',
                  height: 6,
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 999,
                  overflow: 'hidden',
                  ml: 3.75,
                }}
              >
                <Box
                  sx={(t) => ({
                    position: 'absolute',
                    inset: 0,
                    width: `${widthPct}%`,
                    bgcolor: t.palette.primary.main,
                    transition: 'width 240ms ease',
                  })}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Top {items.length} {dimensionLabel(dim).toLowerCase()} by {metricLabel(metric)}
      </Typography>
    </Box>
  );
}
