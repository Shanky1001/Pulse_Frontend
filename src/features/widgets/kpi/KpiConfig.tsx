import { MenuItem, Stack, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type KpiDisplay = {
  format: 'auto' | 'integer' | 'percent' | 'currency';
};

export const kpiDefaultDisplay: KpiDisplay = { format: 'auto' };

export default function KpiConfig({ display, onDisplayChange }: ConfigFormProps<KpiDisplay>) {
  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Number format"
        size="small"
        value={display.format}
        onChange={(e) => onDisplayChange({ format: e.target.value as KpiDisplay['format'] })}
      >
        <MenuItem value="auto">Auto (from metric type)</MenuItem>
        <MenuItem value="integer">Integer</MenuItem>
        <MenuItem value="percent">Percent</MenuItem>
        <MenuItem value="currency">Currency</MenuItem>
      </TextField>
    </Stack>
  );
}
