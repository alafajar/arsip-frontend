import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { AuthGate } from '@/features/auth/components/AuthGate';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks/useLogout';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

const queryClient = new QueryClient();

// TEMP(FE-005): pindah ke sidebar saat AppShell selesai
function PlaceholderHome() {
  const { logout } = useLogout();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)]">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Wreksa — siap</h1>
      <Button variant="outline" onClick={logout}>
        Keluar
      </Button>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate>
          <Suspense>
            <Routes>
              <Route element={<RedirectIfAuthed />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route element={<RequireAuth />}>
                <Route path="/" element={<PlaceholderHome />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthGate>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
