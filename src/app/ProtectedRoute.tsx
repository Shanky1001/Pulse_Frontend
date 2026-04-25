import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetMeQuery } from '@/store/api/authApi';
import { isLocalTestSession } from '@/lib/localTestSession';

type Props = {
  children: ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  const connected = useAppSelector((state) => state.auth.connected);
  const location = useLocation();
  const localTest = isLocalTestSession();
  const { isLoading, isUninitialized } = useGetMeQuery(undefined, { skip: localTest });

  if (localTest) {
    return children;
  }

  if (isLoading || isUninitialized) {
    return null;
  }

  if (!connected) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
