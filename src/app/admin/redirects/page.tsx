// src/app/redirects/page.tsx
import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { cache } from 'react';
import RedirectsListClient from '@/components/redirects/RedirectsListClient';
import { RedirectService } from '@/server/modules/redirects/services/redirect.service';

export const dynamic = 'force-dynamic';

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListResponse = {
  items: RedirectDTO[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

const STATUS_OPTIONS = [301, 302, 307, 308] as const;
const SORTABLE_FIELDS = [
  'createdAt',
  'updatedAt',
  'fromPath',
  'toPath',
  'statusCode',
  'isActive',
] as const;

function buildQuery(sp: Record<string, string | string[] | undefined>) {
  const p = new URLSearchParams();
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) || '';

  const q = get('q').trim();
  if (q) p.set('q', q);

  const isActive = get('isActive');
  if (isActive === 'true' || isActive === 'false') p.set('isActive', isActive);

  const statusCode = sp['statusCode'];
  const codes = (Array.isArray(statusCode) ? statusCode : statusCode ? [statusCode] : []).map(
    String
  );
  for (const c of codes) p.append('statusCode', c);

  const createdFrom = get('createdFrom');
  const createdTo = get('createdTo');
  if (createdFrom) p.set('createdFrom', createdFrom);
  if (createdTo) p.set('createdTo', createdTo);

  const sortBy = get('sortBy');
  p.set(('sortBy' as any) as string, (SORTABLE_FIELDS as readonly string[]).includes(sortBy) ? sortBy : 'createdAt');

  const sortDir = get('sortDir');
  p.set('sortDir', sortDir === 'ASC' ? 'ASC' : 'DESC');

  const page = parseInt(get('page') || '1', 10) || 1;
  const pageSize = parseInt(get('pageSize') || '20', 10) || 20;
  p.set('page', String(Math.max(1, page)));
  p.set('pageSize', String(pageSize));

  return p.toString();
}

const fetchRedirectsFromService = cache(
  async (sp: Record<string, string | string[] | undefined>): Promise<ListResponse> => {
    noStore();

    const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) || '';
    const getAll = (k: string) => (Array.isArray(sp[k]) ? sp[k] : sp[k] ? [sp[k] as string] : []);

    const q = get('q').trim() || undefined;

    const isActiveStr = get('isActive');
    const isActive =
      isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;

    const statusCodes = getAll('statusCode')
      .map((v) => parseInt(String(v), 10))
      .filter((n) => [301, 302, 307, 308].includes(n)) as (301 | 302 | 307 | 308)[];

    const createdFromStr = get('createdFrom') || undefined;
    const createdToStr = get('createdTo') || undefined;
    const createdFrom = createdFromStr ? new Date(createdFromStr) : undefined;
    const createdTo = createdToStr ? new Date(createdToStr) : undefined;

    const sortByRaw = get('sortBy');
    const sortBy = (SORTABLE_FIELDS as readonly string[]).includes(sortByRaw)
      ? (sortByRaw as typeof SORTABLE_FIELDS[number])
      : 'createdAt';
    const sortDir = get('sortDir') === 'ASC' ? 'ASC' : 'DESC';

    const page = Math.max(parseInt(get('page') || '1', 10) || 1, 1);
    const pageSize = Math.max(1, Math.min(parseInt(get('page') || '20', 10) || 20, 100));

    const svc = new RedirectService();
    const res = await svc.list({
      q,
      searchIn: 'both',
      isActive,
      statusCode: statusCodes.length ? statusCodes : undefined,
      createdFrom,
      createdTo,
      sortBy,
      sortDir,
      page,
      pageSize,
    });

    const items: RedirectDTO[] = (res.items ?? []).map((r: any) => ({
      id: String(r.id),
      fromPath: String(r.fromPath),
      toPath: String(r.toPath),
      statusCode: Number(r.statusCode) as 301 | 302 | 307 | 308,
      isActive: !!r.isActive,
      createdAt:
        typeof r.createdAt === 'string'
          ? r.createdAt
          : r.createdAt
          ? new Date(r.createdAt).toISOString()
          : '',
      updatedAt:
        typeof r.updatedAt === 'string'
          ? r.updatedAt
          : r.updatedAt
          ? new Date(r.updatedAt).toISOString()
          : '',
    }));

    return {
      items,
      total: Number(res.total ?? items.length),
      page: Number(res.page ?? page),
      pageSize: Number(res.pageSize ?? pageSize),
      pages: Number(res.pages ?? Math.ceil((res.total ?? items.length) / (res.pageSize ?? pageSize))),
    };
  }
);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = buildQuery(sp);
  const initial = await fetchRedirectsFromService(sp);

  return (
    <RedirectsListClient
      initialQueryString={qs}
      initialData={initial}
      statusOptions={STATUS_OPTIONS as any}
      sortableFields={SORTABLE_FIELDS as any}
    />
  );
}
