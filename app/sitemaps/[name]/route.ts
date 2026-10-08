import { buildSitemap, SITEMAP_TYPES, xml, type SitemapType } from '@/lib/sitemap';
import { isLocale } from '@/lib/i18n';

export const revalidate = 3600;
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^([a-z]{2})-(\w+)\.xml$/.exec(name);
  if (!m || !isLocale(m[1]) || !SITEMAP_TYPES.includes(m[2] as SitemapType)) return xml('<error/>', 404);
  return xml(buildSitemap(m[1], m[2] as SitemapType));
}
