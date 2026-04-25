import { MenuItem, Stack, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type GeoDisplay = {
  topN: number;
};

export const geoDefaultDisplay: GeoDisplay = { topN: 10 };

export default function GeoConfig({ display, onDisplayChange }: ConfigFormProps<GeoDisplay>) {
  return (
    <Stack spacing={1.25}>
      <TextField
        select
        label="Top N regions"
        size="small"
        value={display.topN}
        onChange={(e) => onDisplayChange({ topN: Number(e.target.value) })}
      >
        {[5, 10, 15, 20].map((n) => (
          <MenuItem key={n} value={n}>{n}</MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
