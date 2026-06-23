import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));

const queryClient = new QueryClient();

function PlaceholderHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)]">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Wreksa — siap</h1>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<PlaceholderHome />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
