import { FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type BarDisplay = {
  stacked: boolean;
  orientation: 'vertical' | 'horizontal';
};

export const barDefaultDisplay: BarDisplay = {
  stacked: false,
  orientation: 'vertical',
};

export default function BarChartConfig({ display, onDisplayChange }: ConfigFormProps<BarDisplay>) {
  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Orientation"
        size="small"
        value={display.orientation}
        onChange={(e) => onDisplayChange({ orientation: e.target.value as BarDisplay['orientation'] })}
      >
        <MenuItem value="vertical">Vertical</MenuItem>
        <MenuItem value="horizontal">Horizontal</MenuItem>
      </TextField>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.stacked}
            onChange={(_, v) => onDisplayChange({ stacked: v })}
          />
        }
        label="Stack series"
      />
    </Stack>
  );
}
