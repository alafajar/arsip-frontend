import { useState } from 'react';
import { toast } from 'sonner';
import { useRenameMenu } from '@/features/menus/hooks/useRenameMenu';
import { useDeleteMenu } from '@/features/menus/hooks/useDeleteMenu';
import type { MenuNode } from '@/types/api';

export interface MapTarget { node: MenuNode }

export function useMapActions(menuId: string | undefined) {
  const [renameTarget, setRenameTarget] = useState<MapTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MapTarget | null>(null);
  const renameMutation = useRenameMenu();
  const deleteMutation = useDeleteMenu();

  const handleRenameConfirm = (name: string) => {
    if (!renameTarget) return;
    renameMutation.mutate(
      { id: renameTarget.node.id, name, parentId: menuId ?? null },
      { onSuccess: () => setRenameTarget(null) },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.node.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  // MOCK(sprint2) — backend belum punya PATCH/DELETE /sheets/:id
  const handleBerkasAction = (action: 'rename' | 'delete') => {
    toast.info(`${action === 'rename' ? 'Ubah' : 'Hapus'} berkas tersedia di Sprint 2.`);
  };

  return {
    renameTarget, setRenameTarget,
    deleteTarget, setDeleteTarget,
    renameMutation, deleteMutation,
    handleRenameConfirm, handleDeleteConfirm, handleBerkasAction,
  };
}
