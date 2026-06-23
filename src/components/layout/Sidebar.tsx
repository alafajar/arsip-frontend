import { useState } from 'react';
import { useMatch } from 'react-router-dom';
import { FolderOpen } from '@phosphor-icons/react';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import { MenuTree } from '@/features/menus/components/MenuTree';
import { UserChip } from '@/components/layout/UserChip';

function MenuSkeleton() {
  return (
    <div className="animate-pulse space-y-2 px-1">
      {[60, 80, 50].map((w) => (
        <div
          key={w}
          className="h-7 rounded-[var(--radius)] bg-[var(--sidebar-border)]"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
      {children}
    </h2>
  );
}

export function Sidebar() {
  const match = useMatch('/konten/:menuId');
  const activeMenuId = match?.params.menuId ?? null;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: tree, isLoading, isError } = useMenuTree();

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-bold select-none">
          W
        </div>
        <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">Wreksa</span>
      </div>

      {/* Scrollable nav */}
      <nav
        aria-label="Navigasi konten"
        className="flex-1 space-y-4 overflow-y-auto px-3 pb-3"
      >
        {/* Section: Konten */}
        <div>
          <SectionLabel>Konten</SectionLabel>
          {isLoading && <MenuSkeleton />}
          {isError && (
            <p className="px-3 py-2 text-xs text-[var(--destructive)]">
              Gagal memuat menu.
            </p>
          )}
          {tree && (
            <MenuTree
              nodes={tree}
              activeMenuId={activeMenuId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
            />
          )}
        </div>

        {/* Section: Arsip (dekoratif Sprint 1) */}
        <div>
          <SectionLabel>Arsip</SectionLabel>
          {(['Berkas Saya', 'Dibagikan'] as const).map((label) => (
            <div
              key={label}
              className="flex cursor-default items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-sm text-[var(--sidebar-foreground)] opacity-50"
              aria-disabled="true"
            >
              <FolderOpen size={14} />
              {label}
            </div>
          ))}
        </div>
      </nav>

      {/* User chip + logout */}
      <UserChip />
    </aside>
  );
}
