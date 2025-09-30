import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";
import { RedirectStatus } from "@/server/modules/redirects/enums/RedirectStatus.enum";
import { getRedirectEnum } from "@/server/modules/redirects/enums/getRedirect.enum";

const CreateCategorySchema = z.object({
  fromPath: z.string(),
  toPath: z.string(),
  statusCode: z.enum(RedirectStatus),
  isActive: z.boolean().optional(),
});
const ListQuerySchema = z.object({
  q: z.string().trim().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(getRedirectEnum).default(getRedirectEnum.CREATEDAT),
  sortDir: z.enum(["ASC", "DESC"]).default("DESC"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  createdFrom: z.string().datetime().optional(), // ISO string
  createdTo: z.string().datetime().optional(), // ISO string
});
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.parse(body);

    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const newCategory = await service.create(parsed);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err: any) {
    console.error("❌ Category create error:", err);

    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: err.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = ListQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortDir: searchParams.get("sortDir") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      createdFrom: searchParams.get("createdFrom") ?? undefined,
      createdTo: searchParams.get("createdTo") ?? undefined,
    });

    const statusCodeParams = searchParams.getAll("statusCode"); 
    let statusCode: RedirectStatus | RedirectStatus[] | undefined = undefined;

    if (statusCodeParams.length === 1) {
      const n = Number(statusCodeParams[0]);
      if ([301, 302, 307, 308].includes(n)) statusCode = n as RedirectStatus;
    } else if (statusCodeParams.length > 1) {
      const arr = statusCodeParams
        .map((s) => Number(s))
        .filter((n) => [301, 302, 307, 308].includes(n)) as RedirectStatus[];
      if (arr.length) statusCode = arr;
    }

    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const result = await service.list({
      q: parsed.q,
      isActive:
        parsed.isActive === "true"
          ? true
          : parsed.isActive === "false"
          ? false
          : undefined,
      statusCode,
      createdFrom: parsed.createdFrom
        ? new Date(parsed.createdFrom)
        : undefined,
      createdTo: parsed.createdTo ? new Date(parsed.createdTo) : undefined,
      sortBy: parsed.sortBy,
      sortDir: parsed.sortDir,
      page: parsed.page,
      pageSize: parsed.pageSize,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("❌ Redirects list error:", err);

    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest,) {
  try {
    const body = await req.json();
    const { id } = body as { id: string };    
    if (!id) {
      return NextResponse.json({ error: "id الزامی است" }, { status: 400 });
    }

    const ds = await getDataSource();
    const service = new RedirectService(ds);

    const ok = await service.remove(id);
    if (!ok) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ redirect DELETE error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}