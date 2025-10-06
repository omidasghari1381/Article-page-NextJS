// src/server/db/entities.ts
export { User } from "@/server/modules/users/entities/user.entity";
export { Article } from "@/server/modules/articles/entities/article.entity";
export { FAQ } from "@/server/modules/faq/entities/faq.entity";
export { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
export { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
export { NewArticle } from "@/server/modules/articles/entities/innerArticle";
export { ArticleCategory } from "@/server/modules/articles/entities/articleCategory.entity";
export { ArticleTag } from "@/server/modules/articles/entities/articleTages.entity";
export { Redirect } from "@/server/modules/redirects/entities/redirect.entity";
export { SeoMeta } from "@/server/modules/metaData/entities/seoMeta.entity";
export { MediaItem } from "@/server/modules/media/entities/mediaItem.entity";

import { User } from "@/server/modules/users/entities/user.entity";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { FAQ } from "@/server/modules/faq/entities/faq.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { NewArticle } from "@/server/modules/articles/entities/innerArticle";
import { ArticleCategory } from "@/server/modules/articles/entities/articleCategory.entity";
import { ArticleTag } from "@/server/modules/articles/entities/articleTages.entity";
import { Redirect } from "@/server/modules/redirects/entities/redirect.entity";
import { SeoMeta } from "@/server/modules/metaData/entities/seoMeta.entity";
import { MediaItem } from "@/server/modules/media/entities/mediaItem.entity";

export const ENTITIES = [
  Redirect,
  ArticleTag,
  User,
  Article,
  NewArticle,
  FAQ,
  CommentArticle,
  ReplyComment,
  ArticleCategory,
  SeoMeta,
  MediaItem,
];
