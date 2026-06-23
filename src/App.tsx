import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { AuthGate } from '@/features/auth/components/AuthGate';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed';
import { AppShell } from '@/components/layout/AppShell';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ContentPage = lazy(() => import('@/features/menus/pages/ContentPage'));
const SheetPage = lazy(() => import('@/features/sheets/pages/SheetPage'));

const queryClient = new QueryClient();

function HomePage() {
  const { data: tree, isLoading } = useMenuTree();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <span className="text-sm text-[var(--muted-foreground)]">Memuat…</span>
      </div>
    );
  }

  if (tree && tree.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">Belum ada map</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Buat map pertama untuk mulai menyimpan berkas.
        </p>
      </div>
    );
  }

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
                  <Route path="/sheets/:sheetId" element={<SheetPage />} />
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
