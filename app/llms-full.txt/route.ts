import { llmsTxt } from '@/lib/llms';
export const revalidate = 86400;
export function GET() {
  return new Response(llmsTxt(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
