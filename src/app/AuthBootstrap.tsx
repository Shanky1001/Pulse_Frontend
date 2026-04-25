import { useEffect, type ReactNode } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { connect, disconnect } from '@/store/slices/authSlice';
import { getLocalTestUser, isLocalTestSession } from '@/lib/localTestSession';

type Props = { children: ReactNode };

export default function AuthBootstrap({ children }: Props) {
  const dispatch = useAppDispatch();
  const localTest = isLocalTestSession();
  const { data, isLoading, isUninitialized } = useGetMeQuery(undefined, {
    skip: localTest,
  });

  useEffect(() => {
    if (!localTest) return;
    dispatch(connect({ user: getLocalTestUser() }));
  }, [dispatch, localTest]);

  useEffect(() => {
    if (!data) return;
    if (data.connected && data.user) {
      dispatch(
        connect({
          user: {
            name: data.user.name,
            email: data.user.email,
          },
        }),
      );
    } else {
      dispatch(disconnect());
    }
  }, [data, dispatch]);

  if (!localTest && (isLoading || isUninitialized)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="caption" color="text.secondary">
            Checking session…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
