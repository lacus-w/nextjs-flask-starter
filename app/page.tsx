'use client';

import { useAuth } from './lib/auth';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen">
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </main>
  );
}
