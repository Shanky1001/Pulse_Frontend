import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { RendererProps } from '../types';
import { dimensionLabel, getMetric, metricLabel } from '@/lib/ga4Catalog';
import { formatDateBucket, formatMetricValue } from '@/lib/format';
import type { TableDisplay } from './TableConfig';

export default function TableWidget({ widget, data, loading, error, display }: RendererProps<TableDisplay>) {
  const dimensions = widget.query.dimensions;
  const metrics = widget.query.metrics;

  const columns = useMemo<GridColDef[]>(() => {
    const dimCols: GridColDef[] = dimensions.map((d) => ({
      field: d,
      headerName: dimensionLabel(d),
      flex: 1,
      minWidth: 140,
      renderCell: (p) => {
        const v = p.value as string | number | undefined;
        if (typeof v === 'string' && /^\d{8,10}$/.test(v)) return formatDateBucket(v);
        return v ?? '';
      },
    }));
    const metCols: GridColDef[] = metrics.map((m) => ({
      field: m,
      headerName: metricLabel(m),
      type: 'number',
      flex: 1,
      minWidth: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => {
        if (value === null || value === undefined) return '';
        const def = getMetric(m);
        return formatMetricValue(m, def?.type === 'percent' ? Number(value) : Number(value));
      },
    }));
    return [...dimCols, ...metCols];
  }, [dimensions, metrics]);

  const rows = useMemo(() => {
    return (data?.rows ?? []).map((r, i) => ({ id: i, ...r }));
  }, [data]);

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

  return (
    <Box sx={{ width: '100%', height: '100%', p: 1 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        density={display.density}
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: display.pageSize, page: 0 } } }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': { background: 'transparent' },
        }}
      />
    </Box>
  );
}
