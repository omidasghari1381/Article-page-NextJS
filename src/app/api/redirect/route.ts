import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RedirectService } from "@/server/modules/redirects/services/redirect.service";

const CreateRedirectSchema = z.object({
  fromPath: z.string().min(1).regex(/^\/.*/, "fromPath باید با / شروع شود"),
  toPath: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//i.test(v),
      "toPath باید مسیر داخلی یا URL معتبر باشد"
    ),
  statusCode: z.union([
    z.literal(301),
    z.literal(302),
    z.literal(307),
    z.literal(308),
  ]),
  isActive: z.boolean().optional(),
});

const ListQuerySchema = z.object({
  q: z.string().trim().optional(),
  searchIn: z.enum(["fromPath", "toPath", "both"]).default("both"),
  isActive: z.enum(["true", "false"]).optional(),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "fromPath",
      "toPath",
      "statusCode",
      "isActive",
    ] as const)
    .default("createdAt"),
  sortDir: z.enum(["ASC", "DESC"]).default("DESC"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dto = CreateRedirectSchema.parse(body);
    if (dto.fromPath === dto.toPath) {
      return NextResponse.json(
        { error: "fromPath equals toPath" },
        { status: 400 }
      );
    }
    const service = new RedirectService();
    const created = await service.create(dto);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError")
      return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = ListQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
      searchIn: (searchParams.get("searchIn") as any) ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortDir: searchParams.get("sortDir") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      createdFrom: searchParams.get("createdFrom") ?? undefined,
      createdTo: searchParams.get("createdTo") ?? undefined,
    });

    const statusCodeParams = searchParams.getAll("statusCode");
    let statusCode: number | number[] | undefined = undefined;
    if (statusCodeParams.length === 1) {
      const n = Number(statusCodeParams[0]);
      if ([301, 302, 307, 308].includes(n)) statusCode = n;
    } else if (statusCodeParams.length > 1) {
      const arr = statusCodeParams
        .map((s) => Number(s))
        .filter((n) => [301, 302, 307, 308].includes(n));
      if (arr.length) statusCode = arr;
    }

    const service = new RedirectService();
    const result = await service.list({
      q: parsed.q,
      searchIn: parsed.searchIn,
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
      sortBy: parsed.sortBy as any,
      sortDir: parsed.sortDir,
      page: parsed.page,
      pageSize: parsed.pageSize,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ZodError")
      return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String((body?.id as string) || "");
    if (!id)
      return NextResponse.json({ error: "id الزامی است" }, { status: 400 });

    const service = new RedirectService();
    const ok = await service.remove(id);
    if (!ok)
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
