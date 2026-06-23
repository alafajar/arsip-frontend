import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLogin } from '@/features/auth/hooks/useLogin';

export default function LoginPage() {
  const { submit, isLoading, loginError, clearError } = useLogin();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <LoginForm
        onSubmit={submit}
        isLoading={isLoading}
        loginError={loginError}
        onFieldChange={clearError}
      />
    </main>
  );
}
