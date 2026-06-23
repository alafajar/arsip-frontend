import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import type { UseLoginReturn } from '@/features/auth/hooks/useLogin';

const schema = z.object({
  username: z.string().min(1, 'Nama pengguna wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
  onSubmit: UseLoginReturn['submit'];
  isLoading: UseLoginReturn['isLoading'];
  loginError: UseLoginReturn['loginError'];
  onFieldChange: UseLoginReturn['clearError'];
}

export function LoginForm({ onSubmit, isLoading, loginError, onFieldChange }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const hasCredentialError = loginError === 'credentials';
  const hasRateLimitError = loginError === 'rate-limited';

  const fieldErrorClass = hasCredentialError
    ? 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]'
    : '';

  const handleChange = () => {
    if (loginError) onFieldChange();
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="items-center text-center gap-3 pb-2">
        {/* Logo */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg-val)] bg-[var(--primary)] text-[var(--primary-foreground)] text-xl font-bold select-none"
          aria-hidden="true"
        >
          W
        </div>
        <span className="text-base font-semibold text-[var(--foreground)]">Wreksa</span>

        <div className="mt-1 space-y-1">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Arsip Anda, terjaga.</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Masuk untuk mengelola, menelusuri, dan merawat berkas Anda.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit((vals) => onSubmit(vals.username, vals.password))}
          className="space-y-4"
          noValidate
        >
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Nama Pengguna</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan nama pengguna"
              autoComplete="username"
              aria-invalid={!!(errors.username || hasCredentialError)}
              className={fieldErrorClass}
              {...register('username', { onChange: handleChange })}
            />
            {errors.username && (
              <p className="text-xs text-[var(--destructive)]">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                aria-invalid={!!(errors.password || hasCredentialError)}
                className={`pr-9 ${fieldErrorClass}`}
                {...register('password', { onChange: handleChange })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)]">{errors.password.message}</p>
            )}
          </div>

          {/* Inline error from API */}
          {hasCredentialError && (
            <p className="text-sm font-medium text-[var(--destructive)]">
              Data yang anda masukkan salah
            </p>
          )}
          {hasRateLimitError && (
            <p className="text-sm font-medium text-[var(--destructive)]">
              Terlalu banyak percobaan, coba lagi nanti.
            </p>
          )}

          {/* Remember me — dekoratif (tanpa efek persist token) */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(val === true)}
              aria-label="Tetap masuk di perangkat ini (dekoratif, tidak memperpanjang sesi)"
            />
            <Label htmlFor="rememberMe" className="cursor-pointer font-normal">
              Tetap masuk di perangkat ini
            </Label>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                Memproses…
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
