import { Box, Typography } from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

type Props = {
  showWordmark?: boolean;
  size?: number;
};

export default function Logo({ showWordmark = true, size = 28 }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={(t) => ({
          width: size,
          height: size,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
          color: '#fff',
        })}
      >
        <InsightsRoundedIcon fontSize="small" />
      </Box>
      {showWordmark ? (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Pulse
        </Typography>
      ) : null}
    </Box>
  );
}
