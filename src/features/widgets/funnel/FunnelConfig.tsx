import { FormControlLabel, Stack, Switch } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type FunnelDisplay = {
  showDropoff: boolean;
};

export const funnelDefaultDisplay: FunnelDisplay = { showDropoff: true };

export default function FunnelConfig({ display, onDisplayChange }: ConfigFormProps<FunnelDisplay>) {
  return (
    <Stack spacing={1.25}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={display.showDropoff}
            onChange={(_, v) => onDisplayChange({ showDropoff: v })}
          />
        }
        label="Show drop-off %"
      />
    </Stack>
  );
}
