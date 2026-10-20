import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import { renderHome } from '@/lib/homePage';
import { getDynamicPageMetadata, renderDynamicPage } from '@/lib/dynamicPage';

function getLocales() {
  return getRuntimeI18nConfig(getConfig().i18n);
}

export function generateStaticParams() {
  const config = getConfig();
  const i18n = getLocales();
  const pages = config.navigation
    .filter((item) => item.type === 'page' && item.target !== 'about')
    .map((item) => ({ slug: item.target }));
  return [...pages, ...i18n.locales.filter((locale) => locale !== i18n.defaultLocale).map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const i18n = getLocales();
  if (slug !== i18n.defaultLocale && i18n.locales.includes(slug)) {
    const config = getConfig(slug);
    return {
      title: { absolute: config.site.title },
      description: config.site.description,
      openGraph: { title: config.site.title, description: config.site.description, locale: slug === 'zh' ? 'zh_CN' : 'en_US' },
    };
  }
  return getDynamicPageMetadata(slug, i18n.defaultLocale);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i18n = getLocales();
  if (slug !== i18n.defaultLocale && i18n.locales.includes(slug)) return renderHome(slug);
  if (!getConfig().navigation.some((item) => item.type === 'page' && item.target === slug)) notFound();
  return renderDynamicPage(slug, i18n.defaultLocale);
}
