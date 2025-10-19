// src/server/modules/i18n/services/i18n.service.ts
import { Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { Locale } from "../entities/locale.entity";
import { TranslationKey } from "../entities/translation-key.entity";
import { TranslationValue } from "../entities/translation-value.entity";
import fs from "fs/promises";
import path from "path";

export type MessagesMap = Record<string, string>;

/* ===================== I18nService (CRUD/Read) ===================== */
export class I18nService {
  private localeRepoP: Promise<Repository<Locale>>;
  private keyRepoP: Promise<Repository<TranslationKey>>;
  private valRepoP: Promise<Repository<TranslationValue>>;

  constructor() {
    this.localeRepoP = (async () => (await getDataSource()).getRepository(Locale))();
    this.keyRepoP = (async () => (await getDataSource()).getRepository(TranslationKey))();
    this.valRepoP = (async () => (await getDataSource()).getRepository(TranslationValue))();
  }

  private async localeRepo() { return this.localeRepoP; }
  private async keyRepo() { return this.keyRepoP; }
  private async valRepo() { return this.valRepoP; }

  /** ایجاد حداقل لوکال‌ها (fa-IR و en) */
  async ensureBaseLocales() {
    const repo = await this.localeRepo();
    const must = [
      { code: "fa-IR", name: "فارسی (ایران)" },
      { code: "en", name: "English" },
    ];
    for (const l of must) {
      const found = await repo.findOne({ where: { code: l.code } });
      if (!found) {
        await repo.save(repo.create({ ...l, isActive: true, version: 1 }));
      }
    }
  }

  /** لیست نام‌فضاها */
  async listNamespaces(): Promise<string[]> {
    const keyRepo = await this.keyRepo();
    const rows = await keyRepo
      .createQueryBuilder("k")
      .select("DISTINCT k.namespace", "ns")
      .orderBy("k.namespace", "ASC")
      .getRawMany();
    return rows.map((r) => r.ns as string);
  }

  /** دریافت پیام‌های یک namespace با fallback */
  async getNamespace(
    namespace: string,
    locale: string,
    fallback: string = "en"
  ): Promise<MessagesMap> {
    const valRepo = await this.valRepo();
    const rows = await valRepo
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.tKey", "k") // ⬅️ توجه: tKey
      .where("k.namespace = :ns", { ns: namespace })
      .andWhere("v.locale IN (:...locs)", { locs: [locale, fallback] })
      .orderBy("v.locale = :loc DESC", "DESC")
      .setParameter("loc", locale)
      .getMany();

    const map: MessagesMap = {};
    for (const r of rows) {
      const k = r.tKey.key; // اگر namespaced می‌خوای، `${r.tKey.namespace}.${r.tKey.key}`
      if (!map[k]) map[k] = r.value;
    }
    return map;
  }

  /** ساخت/به‌روزرسانی یک مقدار ترجمه */
  async upsertValue(
    namespace: string,
    key: string,
    locale: string,
    value: string,
    isDraft = false
  ) {
    const keyRepo = await this.keyRepo();
    const valRepo = await this.valRepo();

    let k = await keyRepo.findOne({ where: { namespace, key } });
    if (!k) {
      k = await keyRepo.save(keyRepo.create({ namespace, key, description: null }));
    }

    let v = await valRepo.findOne({ where: { tKey: { id: k.id }, locale } }); // ⬅️ tKey
    if (!v) {
      v = valRepo.create({ tKey: k, locale, value, isDraft }); // ⬅️ tKey
    } else {
      v.value = value;
      v.isDraft = isDraft;
    }
    await valRepo.save(v);
  }
}

/* ===================== I18nVersionService (Versioning) ===================== */
export class I18nVersionService {
  private repoP: Promise<Repository<Locale>>;
  constructor() {
    this.repoP = (async () => (await getDataSource()).getRepository(Locale))();
  }
  private async repo() { return this.repoP; }

  async getActiveLocales(): Promise<Locale[]> {
    const r = await this.repo();
    return r.find({
      where: { isActive: true },
      order: { sortOrder: "ASC", code: "ASC" as any },
    });
  }

  async getVersion(code: string): Promise<number> {
    const r = await this.repo();
    const loc = await r.findOne({ where: { code } });
    return loc?.version ?? 1;
  }

  async bumpVersion(code: string): Promise<number> {
    const r = await this.repo();
    const loc = await r.findOne({ where: { code } });
    if (!loc) throw new Error(`Locale not found: ${code}`);
    loc.version = (loc.version ?? 1) + 1;
    await r.save(loc);
    return loc.version;
  }
}

/* ===================== I18nPublishService (Build & Write JSON) ===================== */
export class I18nPublishService {
  private valRepoP: Promise<Repository<TranslationValue>>;
  private static readonly BASE_DIR = path.join(process.cwd(), "public", "i18n");
  private readonly USE_NAMESPACED_KEYS = true;

  constructor() {
    this.valRepoP = (async () => (await getDataSource()).getRepository(TranslationValue))();
  }
  private async valRepo() { return this.valRepoP; }

  /** ساخت map برای یک locale؛ اگر USE_NAMESPACED_KEYS=true باشد خروجی به صورت ns.key است */
  async buildLocaleMap(
    locale: string,
    fallback: string = "en"
  ): Promise<Record<string, string>> {
    const valRepo = await this.valRepo();
    const rows = await valRepo
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.tKey", "k") // ⬅️ tKey
      .where("v.locale IN (:...locs)", { locs: [locale, fallback] })
      .orderBy("v.locale = :loc DESC", "DESC")
      .setParameter("loc", locale)
      .getMany();

    const out: Record<string, string> = {};
    for (const r of rows) {
      const key = this.USE_NAMESPACED_KEYS
        ? `${r.tKey.namespace}.${r.tKey.key}`
        : r.tKey.key;
      if (!(key in out)) out[key] = r.value; // اولویت با locale اصلی
    }
    return out;
  }

  /** نوشتن JSON اتمیک روی public/i18n */
  private async writeJsonAtomically(fileName: string, data: unknown) {
    await fs.mkdir(I18nPublishService.BASE_DIR, { recursive: true });
    const tmp = path.join(I18nPublishService.BASE_DIR, `${fileName}.tmp`);
    const final = path.join(I18nPublishService.BASE_DIR, fileName);
    await fs.writeFile(tmp, JSON.stringify(data, null, 0), "utf8");
    await fs.rename(tmp, final);
    return final;
  }

  /** پابلیش یک locale: (versioned + alias) */
  async publishLocale(locale: string, version: number, withAlias = true) {
    const map = await this.buildLocaleMap(locale);
    const versioned = `${locale}.v${version}.json`;
    await this.writeJsonAtomically(versioned, map);
    if (withAlias) {
      await this.writeJsonAtomically(`${locale}.json`, map);
    }
    return {
      files: [`/i18n/${versioned}`].concat(withAlias ? [`/i18n/${locale}.json`] : []),
    };
  }

  /** پابلیش همه زبان‌های فعال (نسخه ++، نوشتن فایل‌ها) */
  static async publishAllActiveLocales() {
    const verSvc = new I18nVersionService();
    const pubSvc = new I18nPublishService();
    const active = await verSvc.getActiveLocales();

    const result: Array<{ locale: string; version: number; files: string[] }> = [];
    for (const loc of active) {
      const newVersion = await verSvc.bumpVersion(loc.code);
      const { files } = await pubSvc.publishLocale(loc.code, newVersion, true);
      result.push({ locale: loc.code, version: newVersion, files });
    }
    return result;
  }
}