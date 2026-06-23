import { Link } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import type { MenuNode } from '@/types/api';

interface BreadcrumbProps {
  path: MenuNode[]; // from root ancestor to current node (inclusive)
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--muted-foreground)]">
        <li>
          <Link
            to="/"
            className="rounded transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Konten
          </Link>
        </li>

        {path.map((node, i) => {
          const isLast = i === path.length - 1;
          return (
            <li key={node.id} className="flex items-center gap-1">
              <CaretRight size={12} aria-hidden="true" />
              {isLast ? (
                <span aria-current="page" className="font-medium text-[var(--foreground)]">
                  {node.name}
                </span>
              ) : (
                <Link
                  to={`/konten/${node.id}`}
                  className="rounded transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {node.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
