export { User } from "../modules/users/entities/user.entity";
export { Article } from "../modules/articles/entities/article.entity";
import { User } from "../modules/users/entities/user.entity";
import { Article } from "../modules/articles/entities/article.entity";
import { FAQ } from "../modules/faq/entities/faq.entity";
import { ReplyComment } from "../modules/articles/entities/reply.entity";
import { CommentArticle } from "../modules/articles/entities/comment.entity";
import { NewArticle } from "../modules/articles/entities/innerArticle";
import { ArticleCategory } from "../modules/articles/entities/articleCategory.entity";
import { ArticleTag } from "../modules/articles/entities/articleTages.entity";
import { Redirect } from "../modules/redirects/entities/redirect.entity";
import { SeoMeta } from "../modules/metaData/entities/seoMeta.entity";
import { SeoMetaHistory } from "../modules/metaData/entities/seoMetaHistory.entity";
export const ENTITIES = [
  // Redirect,
  // ArticleTag,
  // User,
  // Article,
  // NewArticle,
  // FAQ,
  // CommentArticle,
  // ReplyComment,
  // ArticleCategory,
  SeoMetaHistory,
  SeoMeta,
] as const;
