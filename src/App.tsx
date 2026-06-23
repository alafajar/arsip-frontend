import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense, useState } from 'react';
import { FolderPlus } from '@phosphor-icons/react';
import { AuthGate } from '@/features/auth/components/AuthGate';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed';
import { AppShell } from '@/components/layout/AppShell';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import { useCanEdit } from '@/features/auth/hooks/useCanEdit';
import { CreateMapDialog } from '@/features/menus/components/CreateMapDialog';
import { Button } from '@/components/ui/button';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ContentPage = lazy(() => import('@/features/menus/pages/ContentPage'));
const SheetPage = lazy(() => import('@/features/sheets/pages/SheetPage'));

const queryClient = new QueryClient();

function HomePage() {
  const { data: tree, isLoading } = useMenuTree();
  const canEdit = useCanEdit();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <span className="text-sm text-[var(--muted-foreground)]">Memuat…</span>
      </div>
    );
  }

  if (tree && tree.length === 0) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">Belum ada map</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Buat map pertama untuk mulai menyimpan berkas.
          </p>
          {canEdit && (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <FolderPlus size={14} />
              Buat Map
            </Button>
          )}
        </div>
        <CreateMapDialog open={dialogOpen} onOpenChange={setDialogOpen} parentId={null} />
      </>
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
