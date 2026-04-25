import { FormControlLabel, Stack, Switch } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type AreaDisplay = {
  smooth: boolean;
  stacked: boolean;
};

export const areaDefaultDisplay: AreaDisplay = { smooth: true, stacked: false };

export default function AreaConfig({ display, onDisplayChange }: ConfigFormProps<AreaDisplay>) {
  return (
    <Stack spacing={1.25}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.smooth}
            onChange={(_, v) => onDisplayChange({ smooth: v })}
          />
        }
        label="Smooth curve"
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.stacked}
            onChange={(_, v) => onDisplayChange({ stacked: v })}
          />
        }
        label="Stacked"
      />
    </Stack>
  );
}
