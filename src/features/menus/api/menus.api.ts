import client from '@/lib/api/client';
import type { MenuNode } from '@/types/api';

export const getTree = async (): Promise<MenuNode[]> => {
  const { data } = await client.get<MenuNode[]>('/menus');
  return data;
};

export const createMenu = async (body: {
  name: string;
  parentId: string | null;
}): Promise<MenuNode> => {
  const { data } = await client.post<MenuNode>('/menus', body);
  return data;
};

export const renameMenu = async (
  id: string,
  body: { name: string; parentId: string | null },
): Promise<MenuNode> => {
  const { data } = await client.patch<MenuNode>(`/menus/${id}`, body);
  return data;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await client.delete(`/menus/${id}`);
};
