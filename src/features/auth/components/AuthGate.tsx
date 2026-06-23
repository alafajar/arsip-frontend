import type { ReactNode } from 'react';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const status = useAuthBootstrap();

  if (status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <span className="text-sm text-[var(--muted-foreground)]">Memuat…</span>
      </div>
    );
  }

  return <>{children}</>;
}
