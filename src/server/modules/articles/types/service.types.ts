export type CreateArticleInput = {
  title: string;
  subject?: string | null;
  mainText: string;
  secondaryText?: string | null;
  introduction?: string | null;
  quotes?: string | null;
  categoryId: string;       
  tagIds?: string[];        
  readingPeriod: number;  
  summery?: string[] | null;
  slug?: string | null;
  thumbnail?: string | null; 
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export type ListArticlesQuery = {
  page?: number;
  perPage?: number;
  categoryId?: string;
  tagId?: string;
  q?: string;
};

export type ExtendedListArticlesQuery = ListArticlesQuery & {
  authorId?: string;
  createdFrom?: string; 
  createdTo?: string;   
  sortBy?: "createdAt" | "updatedAt" | "viewCount" | "readingPeriod" | "title" | "slug";
  sortDir?: "ASC" | "DESC";
  pageSize?: number; 
};

export type ListResult<T> = {
  page: number;
  perPage: number;
  total: number;
  items: T[];
};

export type ArticleDTO = {
  id: string;
  title: string;
  slug: string | null;
  subject: string | null;
  readingPeriod: number;
  viewCount: number;
  thumbnail: string | null; 
  introduction: string | null;
  quotes: string | null;
  summery: string[] | null;
  mainText: string;
  secondaryText: string | null;
  author: { id: string; firstName: string; lastName: string } | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  createdAt: Date;
  createdAtISO?: string;
};
