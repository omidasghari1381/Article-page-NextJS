export { User } from "../modules/users/entities/user.entity";
export { Article } from "../modules/articles/entities/article.entity";
import { User } from "../modules/users/entities/user.entity";
import { Article } from "../modules/articles/entities/article.entity";
import { FAQ } from "../modules/faq/entities/faq.entity";
import { ReplyComment } from "../modules/articles/entities/reply.entity";
import { CommentArticle } from "../modules/articles/entities/comment.entity";
import { NewArticle } from "../modules/articles/entities/innerArticle";
import { ArticleCategory } from "../modules/articles/entities/articleCategory.entity";
export const ENTITIES = [
  User,
  Article,
  NewArticle,
  FAQ,
  CommentArticle,
  ReplyComment,
  ArticleCategory
] as const;
