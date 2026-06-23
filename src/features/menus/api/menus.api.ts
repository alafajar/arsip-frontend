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
