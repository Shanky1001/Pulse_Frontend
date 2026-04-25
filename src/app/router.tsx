import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import DashboardEditorPage from '@/features/editor/DashboardEditorPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
