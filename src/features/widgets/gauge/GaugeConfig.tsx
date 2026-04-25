import { Stack, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type GaugeDisplay = {
  target: number;
};

export const gaugeDefaultDisplay: GaugeDisplay = { target: 5000 };

export default function GaugeConfig({ display, onDisplayChange }: ConfigFormProps<GaugeDisplay>) {
  return (
    <Stack spacing={1.25}>
      <TextField
        label="Target"
        size="small"
        type="number"
        value={display.target}
        onChange={(e) => onDisplayChange({ target: Number(e.target.value) || 0 })}
        helperText="Goal value the metric is measured against."
      />
    </Stack>
  );
}
