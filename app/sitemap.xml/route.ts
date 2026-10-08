import { buildIndex, xml } from '@/lib/sitemap';
export const revalidate = 3600;
export function GET() {
  return xml(buildIndex());
}
