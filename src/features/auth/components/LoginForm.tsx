import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const schema = z.object({
  username: z.string().min(1, 'Nama pengguna wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type FormValues = z.infer<typeof schema>;

export interface LoginFormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isPending: boolean;
  errorMessage?: string | null;
  hasFieldError?: boolean;
}

export function LoginForm({ onSubmit, isPending, errorMessage, hasFieldError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const fieldErrorClass = hasFieldError
    ? 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]'
    : '';

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="items-center text-center gap-3 pb-2">
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
          onSubmit={handleSubmit((vals) =>
            onSubmit({ username: vals.username, password: vals.password, rememberMe }),
          )}
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
              disabled={isPending}
              aria-invalid={!!(errors.username || hasFieldError)}
              className={fieldErrorClass}
              {...register('username')}
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
                disabled={isPending}
                aria-invalid={!!(errors.password || hasFieldError)}
                className={`pr-9 ${fieldErrorClass}`}
                {...register('password')}
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

          {/* Error message dari luar (mis. 401 atau 429) */}
          {errorMessage && (
            <p className="text-sm font-medium text-[var(--destructive)]">{errorMessage}</p>
          )}

          {/* Tetap masuk — dekoratif (tanpa efek persist token) */}
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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
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
