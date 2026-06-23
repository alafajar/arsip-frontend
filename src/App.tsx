import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { AuthGate } from '@/features/auth/components/AuthGate';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed';
import { AppShell } from '@/components/layout/AppShell';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ContentPage = lazy(() => import('@/features/menus/pages/ContentPage'));

const queryClient = new QueryClient();

function HomePage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <p className="text-sm text-[var(--muted-foreground)]">
        Pilih map di samping untuk memulai.
      </p>
    </div>
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
                <Route element={<AppShell />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/konten/:menuId" element={<ContentPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthGate>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
