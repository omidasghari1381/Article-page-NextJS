// services/user-search.ts
import { DataSource, Raw } from "typeorm";
import { User } from "@/server/modules/users/entities/user.entity";
import { escapeLike } from "@/utils/like";

type UserLite = { id: string; username: string; image: string | null };

export async function searchUsersByUsername(
  ds: DataSource,
  q: string
): Promise<UserLite[]> {
  const term = (q ?? "").trim();
  if (!term) return [];

  const pattern = `%${escapeLike(term)}%`; // substring match

  const repo = ds.getRepository(User);
  const rows = await repo.find({
    where: {
      username: Raw(
        (alias) => `LOWER(${alias}) LIKE LOWER(:pattern) ESCAPE '\\'`,
        { pattern }
      ),
    },
    take: 10,
    order: { username: "ASC" },
    select: { id: true, username: true, image: true },
  });

  return rows.map((u) => ({
    id: u.id,
    username: u.username,
    image: u.image ?? null,
  }));
}
