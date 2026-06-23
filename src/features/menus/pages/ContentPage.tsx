import { useParams } from 'react-router-dom';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import type { MenuNode } from '@/types/api';

function findNode(nodes: MenuNode[], id: string): MenuNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
}

export default function ContentPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const { data: tree } = useMenuTree();

  const node = menuId && tree ? findNode(tree, menuId) : undefined;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        {node?.name ?? 'Konten'}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Browser sheet akan ditampilkan di sini pada FE-006.
      </p>
    </div>
  );
}
