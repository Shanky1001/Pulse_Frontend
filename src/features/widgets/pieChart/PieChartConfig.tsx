import { FormControlLabel, Stack, Switch } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type PieDisplay = {
  donut: boolean;
};

export const pieDefaultDisplay: PieDisplay = { donut: true };

export default function PieChartConfig({ display, onDisplayChange }: ConfigFormProps<PieDisplay>) {
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.donut}
            onChange={(_, v) => onDisplayChange({ donut: v })}
          />
        }
        label="Donut style"
      />
    </Stack>
  );
}
