import type { getRedirectEnum } from "../enums/getRedirect.enum";
import type { RedirectStatus } from "../enums/RedirectStatus.enum";

export type UpdateRedirectDto = Partial<{
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatus;
  isActive: boolean;
}>;

export type ListRedirectsQuery = {
  q?: string;
  isActive?: boolean;
  statusCode?: RedirectStatus | RedirectStatus[];
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: getRedirectEnum;
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