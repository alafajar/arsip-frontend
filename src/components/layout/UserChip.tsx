import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function UserChip() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 border-t border-[var(--sidebar-border)] px-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-[var(--sidebar-foreground)]">
          {user.username}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">{user.role}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        aria-label="Keluar"
        className="shrink-0 rounded-[var(--radius)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <SignOut size={16} />
      </button>
    </div>
  );
}
