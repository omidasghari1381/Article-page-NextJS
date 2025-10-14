import type { RedirectStatus } from "../enums/RedirectStatus.enum";

export type UpdateRedirectDto = Partial<{
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatus;
  isActive: boolean;
}>;

export type ListRedirectsQuery = {
  q?: string;
  searchIn?: "fromPath" | "toPath" | "both";
  isActive?: boolean;
  statusCode?: number | number[];
  createdFrom?: Date | string;
  createdTo?: Date | string;
  sortBy?: "createdAt" | "updatedAt" | "fromPath" | "toPath" | "statusCode" | "isActive";
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};

export type CreateRedirectDto = {
  fromPath: string;
  toPath: string;
  statusCode?: RedirectStatus;
  isActive?: boolean;
};