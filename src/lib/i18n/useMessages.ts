'use client';

import { getMessages, messages } from '@/lib/i18n/messages';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { usePathname } from 'next/navigation';

export function useMessages() {
  const locale = useLocaleStore((state) => state.locale);
  const pathname = usePathname();
  const pathLocale = pathname.split('/').filter(Boolean)[0];
  return getMessages(pathLocale && Object.hasOwn(messages, pathLocale) ? pathLocale : locale);
}
