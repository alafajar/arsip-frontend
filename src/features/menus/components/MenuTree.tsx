import { useNavigate } from 'react-router-dom';
import { CaretRight, CaretDown, FolderSimple, PencilSimple, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { MenuNode } from '@/types/api';

interface NodeProps {
  node: MenuNode;
  activeMenuId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
  parentId: string | null;
  canEdit: boolean;
  onRenameNode: (node: MenuNode, parentId: string | null) => void;
  onDeleteNode: (node: MenuNode, parentId: string | null) => void;
}

function MenuNodeItem({
  node, activeMenuId, expandedIds, onToggle, depth,
  parentId, canEdit, onRenameNode, onDeleteNode,
}: NodeProps) {
  const navigate = useNavigate();
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = activeMenuId === node.id;

  const accentFg = 'text-[var(--sidebar-accent-foreground)]';
  const mutedFg = 'text-[var(--muted-foreground)]';

  return (
    <li>
      {/* Wrapper isolates the left-bar to the row height only, not children */}
      <div className="relative">
        {isActive && (
          <span aria-hidden="true" className="absolute left-0 inset-y-0 w-0.5 bg-[var(--primary)]" />
        )}
        <div
          className={cn(
            'group flex items-center rounded-[var(--radius)]',
            isActive ? 'bg-[var(--sidebar-accent)]' : 'hover:bg-[var(--muted)]',
          )}
          style={{ paddingLeft: `${depth * 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(node.id)}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Tutup' : 'Buka'} ${node.name}`}
              className={cn(
                'shrink-0 rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                'hover:bg-[var(--sidebar-border)]',
                isActive ? accentFg : mutedFg,
              )}
            >
              {isExpanded
                ? <CaretDown size={12} weight="bold" />
                : <CaretRight size={12} weight="bold" />}
            </button>
          ) : (
            <span className="w-[28px] shrink-0" aria-hidden="true" />
          )}

          <FolderSimple
            size={14}
            weight={isActive ? 'fill' : 'regular'}
            className={cn('mr-1.5 shrink-0', isActive ? accentFg : mutedFg)}
          />

          <button
            type="button"
            onClick={() => navigate(`/konten/${node.id}`)}
            className={cn(
              'flex-1 truncate py-1.5 pr-1 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              isActive ? `font-medium ${accentFg}` : 'text-[var(--sidebar-foreground)]',
            )}
          >
            {node.name}
          </button>

          {canEdit && (
            <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                aria-label="Ubah nama"
                onClick={(e) => { e.stopPropagation(); onRenameNode(node, parentId); }}
                className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--sidebar-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <PencilSimple size={14} />
              </button>
              <button
                type="button"
                aria-label="Hapus"
                onClick={(e) => { e.stopPropagation(); onDeleteNode(node, parentId); }}
                className="rounded p-1 text-[var(--destructive)] hover:bg-[var(--sidebar-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <Trash size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul role="list" className="mt-0.5 space-y-0.5">
          {node.children
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((child) => (
              <MenuNodeItem
                key={child.id}
                node={child}
                activeMenuId={activeMenuId}
                expandedIds={expandedIds}
                onToggle={onToggle}
                depth={depth + 1}
                parentId={node.id}
                canEdit={canEdit}
                onRenameNode={onRenameNode}
                onDeleteNode={onDeleteNode}
              />
            ))}
        </ul>
      )}
    </li>
  );
}

interface MenuTreeProps {
  nodes: MenuNode[];
  activeMenuId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  canEdit: boolean;
  onRenameNode: (node: MenuNode, parentId: string | null) => void;
  onDeleteNode: (node: MenuNode, parentId: string | null) => void;
}

export function MenuTree({
  nodes, activeMenuId, expandedIds, onToggle,
  canEdit, onRenameNode, onDeleteNode,
}: MenuTreeProps) {
  if (nodes.length === 0) {
    if (canEdit) return null;
    return (
      <p className="py-2 text-xs text-[var(--muted-foreground)]">Belum ada menu.</p>
    );
  }

  const sorted = nodes.slice().sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <ul role="list" className="space-y-0.5">
      {sorted.map((node) => (
        <MenuNodeItem
          key={node.id}
          node={node}
          activeMenuId={activeMenuId}
          expandedIds={expandedIds}
          onToggle={onToggle}
          depth={0}
          parentId={null}
          canEdit={canEdit}
          onRenameNode={onRenameNode}
          onDeleteNode={onDeleteNode}
        />
      ))}
    </ul>
  );
}
