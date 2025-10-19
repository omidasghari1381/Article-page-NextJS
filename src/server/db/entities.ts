import { User } from "@/server/modules/users/entities/user.entity";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { FAQ } from "@/server/modules/faq/entities/faq.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { NewArticle } from "@/server/modules/articles/entities/innerArticle";
import { ArticleCategory } from "@/server/modules/categories/entities/category.entity";
import { ArticleTag } from "@/server/modules/tags/entities/tage.entity";
import { Redirect } from "@/server/modules/redirects/entities/redirect.entity";
import { SeoMeta } from "@/server/modules/metaData/entities/seoMeta.entity";
import { MediaItem } from "@/server/modules/media/entities/mediaItem.entity";
import type { EntitySchema } from "typeorm";
import { TranslationValue } from "../modules/i18n/entities/translation-value.entity";
import { TranslationKey } from "../modules/i18n/entities/translation-key.entity";
import { Locale } from "../modules/i18n/entities/locale.entity";

export const ENTITIES: (Function | EntitySchema<any> | string)[] = [
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
  TranslationValue,
  TranslationKey,
  Locale,
];

export {
  User,
  Article,
  FAQ,
  ReplyComment,
  CommentArticle,
  NewArticle,
  ArticleCategory,
  ArticleTag,
  Redirect,
  SeoMeta,
  MediaItem,
  TranslationValue,
  TranslationKey,
  Locale,
};
