import { FormControlLabel, Stack, Switch } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type LineDisplay = {
  smooth: boolean;
};

export const lineDefaultDisplay: LineDisplay = { smooth: true };

export default function LineChartConfig({ display, onDisplayChange }: ConfigFormProps<LineDisplay>) {
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.smooth}
            onChange={(_, v) => onDisplayChange({ smooth: v })}
          />
        }
        label="Smooth lines"
      />
    </Stack>
  );
}
