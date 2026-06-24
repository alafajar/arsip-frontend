import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function UserChip() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();

  if (!user) return null;

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--sidebar-border)] px-3 py-3">
      {/* Pill: username + initial avatar */}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--sidebar-foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <span>{user.username}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)]">
          {initial}
        </span>
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        aria-label="Logout"
        title="Logout"
        className="cursor-pointer shrink-0 rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <SignOut size={18} />
      </button>
    </div>
  );
}
