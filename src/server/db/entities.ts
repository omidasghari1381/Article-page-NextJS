// مسیرها را یکدست نگه دار. من همه را relative نوشتم (پیشنهاد می‌کنم یا همگی relative یا همگی alias).
export { User } from "../modules/users/entities/user.entity";
export { Article } from "../modules/articles/entities/article.entity";

// اگر جایی نیاز شد مجموعه‌ی آماده بدهیم:
import { User } from "../modules/users/entities/user.entity";
import { Article } from "../modules/articles/entities/article.entity";
export const ENTITIES = [User, Article] as const;