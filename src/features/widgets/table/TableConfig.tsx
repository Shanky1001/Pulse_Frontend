import { MenuItem, Stack, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type TableDisplay = {
  density: 'compact' | 'standard' | 'comfortable';
  pageSize: 10 | 25 | 50;
};

export const tableDefaultDisplay: TableDisplay = {
  density: 'standard',
  pageSize: 10,
};

export default function TableConfig({ display, onDisplayChange }: ConfigFormProps<TableDisplay>) {
  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Density"
        size="small"
        value={display.density}
        onChange={(e) => onDisplayChange({ density: e.target.value as TableDisplay['density'] })}
      >
        <MenuItem value="compact">Compact</MenuItem>
        <MenuItem value="standard">Standard</MenuItem>
        <MenuItem value="comfortable">Comfortable</MenuItem>
      </TextField>
      <TextField
        select
        label="Rows per page"
        size="small"
        value={display.pageSize}
        onChange={(e) => onDisplayChange({ pageSize: Number(e.target.value) as TableDisplay['pageSize'] })}
      >
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
      </TextField>
    </Stack>
  );
}
