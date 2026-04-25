import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

type Props = {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

export default function EmptyState({
  title = 'Your canvas is empty',
  description = 'Drag a widget from the left to add it here.',
  icon,
}: Props) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{
        height: '100%',
        textAlign: 'center',
        color: 'text.secondary',
        px: 4,
      }}
    >
      <Box
        sx={(t) => ({
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: t.palette.action.hover,
        })}
      >
        {icon ?? <DashboardCustomizeRoundedIcon />}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    </Stack>
  );
}
