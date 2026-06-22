import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowRight } from '@phosphor-icons/react';
const queryClient = new QueryClient();

function PlaceholderPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
      <h1 className="text-2xl font-semibold text-[var(--color-fg)]">Wreksa — siap</h1>
      <Button>
        Mulai
        <ArrowRight weight="bold" />
      </Button>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlaceholderPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors />
    </QueryClientProvider>
  );
}
