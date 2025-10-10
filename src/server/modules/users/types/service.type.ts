import type { getUserEnum } from "../enums/sortUserBy.enum";
import type { userRoleEnum } from "../enums/userRoleEnum";

export type UpdateUserDto = Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
  role: userRoleEnum;
}>;

export type ListUserQuery = {
  q?: string;
  role?: userRoleEnum | userRoleEnum[];
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: getUserEnum;
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
  withDeleted?: boolean; 
  deletedOnly?: boolean; 
};