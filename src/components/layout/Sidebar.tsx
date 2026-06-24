import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Archive,
  FolderOpen,
  FolderPlus,
  Plus,
} from "@phosphor-icons/react";
import { useMenuTree } from "@/features/menus/hooks/useMenuTree";
import { MenuTree } from "@/features/menus/components/MenuTree";
import { UserChip } from "@/components/layout/UserChip";
import { CreateMapDialog } from "@/features/menus/components/CreateMapDialog";
import { RenameMapDialog } from "@/features/menus/components/RenameMapDialog";
import { DeleteMapDialog } from "@/features/menus/components/DeleteMapDialog";
import { useCanEdit } from "@/features/auth/hooks/useCanEdit";
import { useRenameMenu } from "@/features/menus/hooks/useRenameMenu";
import { useDeleteMenu } from "@/features/menus/hooks/useDeleteMenu";
import { getAncestorPath } from "@/features/menus/lib/find-node";
import type { MenuNode } from "@/types/api";

interface RenameTarget {
  node: MenuNode;
  parentId: string | null;
}
interface DeleteTarget {
  node: MenuNode;
}

function MenuSkeleton() {
  return (
    <div className="animate-pulse space-y-1 py-1">
      {[65, 80, 55].map((w) => (
        <div
          key={w}
          className="h-7 rounded-[var(--radius)] bg-[var(--sidebar-border)]"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

/** Nav-row-styled section header matching the design screenshots */
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-base text-zinc-950">
      <Icon size={14} className="shrink-0" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function Sidebar() {
  const match = useMatch("/konten/:menuId");
  const activeMenuId = match?.params.menuId ?? null;
  const navigate = useNavigate();

  const canEdit = useCanEdit();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const { data: tree, isLoading, isError } = useMenuTree();
  const renameMutation = useRenameMenu();
  const deleteMutation = useDeleteMenu();

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

  const handleRenameNode = (node: MenuNode, parentId: string | null) => {
    setRenameTarget({ node, parentId });
  };

  const handleDeleteNode = (node: MenuNode) => {
    setDeleteTarget({ node });
  };

  const handleRenameConfirm = (name: string) => {
    if (!renameTarget) return;
    renameMutation.mutate(
      { id: renameTarget.node.id, name, parentId: renameTarget.parentId },
      { onSuccess: () => setRenameTarget(null) },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.node.id;
    deleteMutation.mutate(deletedId, {
      onSuccess: () => {
        setDeleteTarget(null);
        if (activeMenuId && tree) {
          const path = getAncestorPath(tree, activeMenuId);
          if (path.some((n) => n.id === deletedId)) navigate("/");
        }
      },
    });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-bold select-none">
          W
        </div>
        <span className="text-sm font-semibold text-[var(--sidebar-foreground)]">
          Wreksa
        </span>
      </div>

      {/* Scrollable nav */}
      <nav
        aria-label="Navigasi konten"
        className="flex-1 space-y-4 overflow-y-auto px-3 pb-3"
      >
        {/* Section: Konten */}
        <div className="space-y-0.5">
          <SectionHeader icon={SquaresFour} label="Konten" />
          {isLoading && <MenuSkeleton />}
          {isError && (
            <p className="py-1 text-xs text-[var(--destructive)]">
              Gagal memuat menu.
            </p>
          )}
          {tree && (
            <MenuTree
              nodes={tree}
              activeMenuId={activeMenuId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              canEdit={canEdit}
              onRenameNode={handleRenameNode}
              onDeleteNode={handleDeleteNode}
            />
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex w-full items-center gap-2 rounded-[var(--radius)] py-1.5 pl-7 pr-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <Plus size={14} />
              Map Baru
            </button>
          )}
        </div>

        {/* Section: Arsip */}
        <div className="space-y-0.5">
          <SectionHeader icon={Archive} label="Arsip" />
          {(["Berkas Saya", "Dibagikan"] as const).map((label) => (
            <div
              key={label}
              className="flex cursor-default items-center gap-2 rounded-[var(--radius)] py-1.5 pl-2 text-sm text-[var(--sidebar-foreground)] opacity-50"
              aria-disabled="true"
            >
              <FolderOpen size={14} />
              {label}
            </div>
          ))}
          {/* MOCK(sprint2) — dekoratif, belum terhubung ke API */}
          <div
            className="flex cursor-default items-center gap-2 rounded-[var(--radius)] py-1.5 pl-2 text-sm text-[var(--muted-foreground)] opacity-40"
            aria-disabled="true"
          >
            <FolderPlus size={14} />+ Arsip Baru
          </div>
        </div>
      </nav>

      <UserChip />

      <CreateMapDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentId={null}
      />

      <RenameMapDialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        initialName={renameTarget?.node.name ?? ""}
        isPending={renameMutation.isPending}
        onConfirm={handleRenameConfirm}
      />

      <DeleteMapDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        mapName={deleteTarget?.node.name ?? ""}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </aside>
  );
}
