import AppRouter from './app/router';
import AuthBootstrap from './app/AuthBootstrap';

export default function App() {
  return (
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  );
}
