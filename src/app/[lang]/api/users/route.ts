// ✅ src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { getUserEnum } from "@/server/modules/users/enums/sortUserBy.enum";
import type { userRoleEnum } from "@/server/modules/users/enums/userRoleEnum";
import { UserService } from "@/server/modules/users/services/users.service";
import type { ListUserQuery } from "@/server/modules/users/types/service.type";

const sortableColumns = [
  "createdAt",
  "firstName",
  "lastName",
  "phone",
  "role",
  "updatedAt",
] as const;
type Sortable = (typeof sortableColumns)[number];
const SortDirEnum = z.enum(["ASC", "DESC"]);

function parseDateOrUndefined(v: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(+d) ? undefined : d;
}

function parseRoleParam(
  sp: URLSearchParams
): userRoleEnum | userRoleEnum[] | undefined {
  const all = sp.getAll("role").flatMap((r) =>
    r
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  if (all.length === 0) return undefined;
  const mapped = all.map((v) => {
    const n = Number(v);
    return Number.isFinite(n) && v !== ""
      ? (n as unknown as userRoleEnum)
      : (v as unknown as userRoleEnum);
  });
  return mapped.length === 1 ? mapped[0] : mapped;
}

const truthy = (v?: string | null) =>
  ["1", "true", "yes"].includes((v ?? "").toLowerCase());

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const q = sp.get("q") ?? undefined;
    const role = parseRoleParam(sp);
    const createdFrom = parseDateOrUndefined(sp.get("createdFrom"));
    const createdTo = parseDateOrUndefined(sp.get("createdTo"));

    const sortByRaw = (sp.get("sortBy") ?? "createdAt") as getUserEnum;
    const sortBy: Sortable = (sortableColumns as readonly string[]).includes(
      sortByRaw as string
    )
      ? (sortByRaw as Sortable)
      : "createdAt";

    const sortDirRaw = (sp.get("sortDir") ?? "DESC").toUpperCase();
    const sortDir = SortDirEnum.safeParse(sortDirRaw).success
      ? (sortDirRaw as "ASC" | "DESC")
      : "DESC";

    const page = Math.max(1, Number(sp.get("page") ?? "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(sp.get("pageSize") ?? "20"))
    );

    const withDeleted = truthy(sp.get("withDeleted"));
    const deletedOnly =
      truthy(sp.get("deletedOnly")) || sp.get("deleted") === "only";
    const finalWithDeleted = withDeleted || deletedOnly;

    const svc = new UserService();

    const payload: ListUserQuery = {
      q,
      role,
      createdFrom,
      createdTo,
      sortBy: sortBy as getUserEnum,
      sortDir,
      page,
      pageSize,
      withDeleted: finalWithDeleted,
      deletedOnly,
    };

    const result = await svc.userList(payload);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ users list error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
