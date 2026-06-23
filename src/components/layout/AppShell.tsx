import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
