import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLogin } from '@/features/auth/hooks/useLogin';
import type { LoginFormValues } from '@/features/auth/components/LoginForm';

const ERROR_MESSAGES: Record<NonNullable<ReturnType<typeof useLogin>['loginError']>, string> = {
  credentials: 'Data yang anda masukkan salah',
  'rate-limited': 'Terlalu banyak percobaan, coba lagi nanti.',
};

export default function LoginPage() {
  const { submit, isLoading, loginError } = useLogin();

  const handleSubmit = ({ username, password }: LoginFormValues) => {
    submit(username, password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <LoginForm
        onSubmit={handleSubmit}
        isPending={isLoading}
        errorMessage={loginError ? ERROR_MESSAGES[loginError] : null}
        hasFieldError={loginError === 'credentials'}
      />
    </main>
  );
}
