import type { sortByEnum } from "../enums/sortBy.enum";
export type CategoryListFilters = {
  q?: string;
  parentId?: string;
  hasParent?: "yes" | "no"; 
  depthMin?: number;
  depthMax?: number;
  createdFrom?: string; 
  createdTo?: string; // ISO
  sortBy?: sortByEnum
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};
