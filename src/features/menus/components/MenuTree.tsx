import { useNavigate } from 'react-router-dom';
import { CaretRight, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { MenuNode } from '@/types/api';

interface NodeProps {
  node: MenuNode;
  activeMenuId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}

function MenuNodeItem({ node, activeMenuId, expandedIds, onToggle, depth }: NodeProps) {
  const navigate = useNavigate();
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = activeMenuId === node.id;

  return (
    <li>
      <div
        className={cn(
          'flex items-center rounded-[var(--radius)]',
          isActive
            ? 'bg-[var(--sidebar-accent)]'
            : 'hover:bg-[var(--muted)]',
        )}
        style={{ paddingLeft: `${depth * 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Tutup' : 'Buka'} ${node.name}`}
            className="shrink-0 rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--sidebar-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {isExpanded
              ? <CaretDown size={12} weight="bold" />
              : <CaretRight size={12} weight="bold" />
            }
          </button>
        ) : (
          <span className="w-[28px] shrink-0" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => navigate(`/konten/${node.id}`)}
          className={cn(
            'flex-1 truncate py-1.5 pr-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            isActive
              ? 'font-medium text-[var(--sidebar-accent-foreground)]'
              : 'text-[var(--sidebar-foreground)]',
          )}
        >
          {node.name}
        </button>
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
}

export function MenuTree({ nodes, activeMenuId, expandedIds, onToggle }: MenuTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-[var(--muted-foreground)]">Belum ada menu.</p>
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
        />
      ))}
    </ul>
  );
}
