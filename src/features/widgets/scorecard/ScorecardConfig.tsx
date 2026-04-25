import { MenuItem, Stack, TextField } from '@mui/material';
import type { ConfigFormProps } from '../types';

export type ScorecardDisplay = {
  columns: 'auto' | 1 | 2 | 3 | 4;
};

export const scorecardDefaultDisplay: ScorecardDisplay = { columns: 'auto' };

export default function ScorecardConfig({ display, onDisplayChange }: ConfigFormProps<ScorecardDisplay>) {
  return (
    <Stack spacing={1.25}>
      <TextField
        select
        label="Columns"
        size="small"
        value={display.columns}
        onChange={(e) =>
          onDisplayChange({
            columns: e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as 1 | 2 | 3 | 4),
          })
        }
      >
        <MenuItem value="auto">Auto</MenuItem>
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={3}>3</MenuItem>
        <MenuItem value={4}>4</MenuItem>
      </TextField>
    </Stack>
  );
}
