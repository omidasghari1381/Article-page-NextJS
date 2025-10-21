export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  SeoEntityType,
  RobotsSetting,
  TwitterCardType,
} from "@/server/modules/metaData/entities/seoMeta.entity"; // فقط برای enum ها
import { SeoMetaService } from "@/server/modules/metaData/services/seoMeta.service";

/** ---------- Schemas ---------- */

const EntityTypeEnum = z.nativeEnum(SeoEntityType);
const RobotsEnum = z.nativeEnum(RobotsSetting);
const TwitterEnum = z.nativeEnum(TwitterCardType);

const BaseBodySchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().min(1, "entityId الزامی است"),
  locale: z.string().max(16).default(""),
  useAuto: z.boolean().optional(),

  // SEO Basics
  seoTitle: z.string().trim().max(255).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  robots: RobotsEnum.nullable().optional(),

  // Open Graph
  ogTitle: z.string().trim().max(255).nullable().optional(),
  ogDescription: z.string().trim().max(320).nullable().optional(),
  ogImageUrl: z.string().url().nullable().optional(),

  // Twitter
  twitterCard: TwitterEnum.nullable().optional(),

  // Article-like meta (as ISO strings)
  publishedTime: z.string().datetime().nullable().optional(),
  modifiedTime: z.string().datetime().nullable().optional(),
  authorName: z.string().trim().max(255).nullable().optional(),

  // Tags
  tags: z.array(z.string().trim()).nullable().optional(),
});

const CreateSchema = BaseBodySchema;
const UpdateSchema = BaseBodySchema;

const QuerySchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().min(1, "entityId الزامی است"),
  locale: z.string().max(16).default(""),
});

/** ---------- Helpers ---------- */

function toDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function fieldsFromParsed(p: z.infer<typeof BaseBodySchema>) {
  return {
    useAuto: p.useAuto,

    // SEO Basics
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    canonicalUrl: p.canonicalUrl ?? null,
    robots: p.robots ?? null,

    // Open Graph
    ogTitle: p.ogTitle ?? null,
    ogDescription: p.ogDescription ?? null,
    ogImageUrl: p.ogImageUrl ?? null,

    // Twitter
    twitterCard: p.twitterCard ?? null,

    // Article-like meta
    publishedTime: toDateOrNull(p.publishedTime),
    modifiedTime: toDateOrNull(p.modifiedTime),
    authorName: p.authorName ?? null,

    // Tags
    tags: p.tags ?? null,
  };
}

/** ---------- POST: Create ---------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.parse(body);

    const ds = await getDataSource();
    const service = new SeoMetaService(ds); // ← دیگه repo مستقیم نمی‌دیم

    const fields = fieldsFromParsed(parsed);

    const out =
      parsed.entityType === SeoEntityType.ARTICLE
        ? await service.createForArticle(parsed.entityId, fields, parsed.locale)
        : await service.createForCategory(
            parsed.entityId,
            fields,
            parsed.locale
          );

    return NextResponse.json(out, { status: 201 });
  } catch (err: any) {
    console.error("❌ SEO create error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

/** ---------- GET: Read one (entityType, entityId, locale) ---------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.parse({
      entityType: searchParams.get("entityType"),
      entityId: searchParams.get("entityId"),
      locale: searchParams.get("locale") ?? "",
    });

    const ds = await getDataSource();
    const service = new SeoMetaService(ds);

    const record =
      parsed.entityType === SeoEntityType.ARTICLE
        ? await service.getForArticle(parsed.entityId, parsed.locale)
        : await service.getForCategory(parsed.entityId, parsed.locale);

    if (!record) {
      return NextResponse.json(
        { error: "SEO meta not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(record, { status: 200 });
  } catch (err: any) {
    console.error("❌ SEO get error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

/** ---------- PATCH: Update (partial) ---------- */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateSchema.parse(body);

    const ds = await getDataSource();
    const service = new SeoMetaService(ds);

    const fields = fieldsFromParsed(parsed);

    const out =
      parsed.entityType === SeoEntityType.ARTICLE
        ? await service.updateForArticle(parsed.entityId, fields, parsed.locale)
        : await service.updateForCategory(
            parsed.entityId,
            fields,
            parsed.locale
          );

    return NextResponse.json(out, { status: 200 });
  } catch (err: any) {
    console.error("❌ SEO update error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}

/** ---------- DELETE: Remove one ---------- */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.parse({
      entityType: searchParams.get("entityType"),
      entityId: searchParams.get("entityId"),
      locale: searchParams.get("locale") ?? "",
    });

    const ds = await getDataSource();
    const service = new SeoMetaService(ds);

    if (parsed.entityType === SeoEntityType.ARTICLE) {
      await service.deleteForArticle(parsed.entityId, parsed.locale);
    } else {
      await service.deleteForCategory(parsed.entityId, parsed.locale);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ SEO delete error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Server Error" },
      { status: 500 }
    );
  }
}
