import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import { getDynamicPageMetadata, renderDynamicPage } from '@/lib/dynamicPage';

export function generateStaticParams() {
  const i18n = getRuntimeI18nConfig(getConfig().i18n);
  return i18n.locales
    .filter((slug) => slug !== i18n.defaultLocale)
    .flatMap((slug) => getConfig(slug).navigation
      .filter((item) => item.type === 'page' && item.target !== 'about')
      .map((item) => ({ slug, page: item.target })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }): Promise<Metadata> {
  const { slug, page } = await params;
  return getDynamicPageMetadata(page, slug);
}

export default async function LocalizedPage({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  const i18n = getRuntimeI18nConfig(getConfig().i18n);
  if (slug === i18n.defaultLocale || !i18n.locales.includes(slug)) notFound();
  if (!getConfig(slug).navigation.some((item) => item.type === 'page' && item.target === page)) notFound();
  return renderDynamicPage(page, slug);
}
