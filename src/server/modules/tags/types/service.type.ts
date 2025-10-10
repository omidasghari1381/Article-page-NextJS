export type TagListQuery = { page: number; perPage: number; q?: string };
export type TagListItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};
export type TagListResult = {
  page: number;
  perPage: number;
  total: number;
  items: TagListItem[];
};
