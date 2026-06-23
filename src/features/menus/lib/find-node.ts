import type { MenuNode } from '@/types/api';

export function findNodeById(nodes: MenuNode[], id: string): MenuNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
}

// Returns path from the matching ancestor down to the target node (inclusive).
// Example: tree [A→[B→[C]]]; getAncestorPath(tree, 'C') → [A, B, C]
export function getAncestorPath(nodes: MenuNode[], id: string): MenuNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = getAncestorPath(node.children, id);
    if (childPath.length > 0) return [node, ...childPath];
  }
  return [];
}
