import { company } from './site';
import { graph, organizationNode, websiteNode } from './seo';
import type { Locale } from './i18n';

/** Sayfa başına tek @graph: kurum + site + sayfa düğümleri (vault standardı: "JSON-LD tek @graph") */
export function pageGraph(lang: Locale, nodes: Record<string, unknown>[]) {
  return graph([organizationNode(company()), websiteNode(lang), ...nodes]);
}
