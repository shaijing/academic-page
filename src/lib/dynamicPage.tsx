import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageConfig, getMarkdownContent, getBibtexContent } from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import DynamicPageClient, { type DynamicPageLocaleData } from '@/components/pages/DynamicPageClient';
import type { BasePageConfig, PublicationPageConfig, TextPageConfig, CardPageConfig } from '@/types/page';
import { getConfig } from '@/lib/config';

function loadDynamicPageData(slug: string, locale: string): DynamicPageLocaleData | null {
  const pageConfig = getPageConfig<BasePageConfig>(slug, locale);
  if (!pageConfig) return null;

  if (pageConfig.type === 'publication') {
    const config = pageConfig as PublicationPageConfig;
    return { type: 'publication', config, publications: parseBibTeX(getBibtexContent(config.source, locale), locale) };
  }
  if (pageConfig.type === 'text') {
    const config = pageConfig as TextPageConfig;
    return { type: 'text', config, content: getMarkdownContent(config.source, locale) };
  }
  if (pageConfig.type === 'card') return { type: 'card', config: pageConfig as CardPageConfig };
  return null;
}

export function getDynamicPageMetadata(slug: string, locale: string): Metadata {
  const config = getPageConfig<BasePageConfig>(slug, locale);
  if (!config) return {};
  return {
    title: { absolute: `${config.title} | ${getConfig(locale).site.title}` },
    description: config.description,
    openGraph: { title: config.title, description: config.description, locale: locale === 'zh' ? 'zh_CN' : 'en_US' },
  };
}

export function renderDynamicPage(slug: string, locale: string) {
  const pageData = loadDynamicPageData(slug, locale);
  if (!pageData) notFound();
  return <DynamicPageClient pageData={pageData} locale={locale} />;
}
