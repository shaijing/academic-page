'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocaleStore } from '@/lib/stores/localeStore';
import type { I18nRuntimeConfig } from '@/types/i18n';
import { usePathname } from 'next/navigation';
import { localeFromPath } from '@/lib/i18n/paths';

interface LocaleProviderProps {
  config: I18nRuntimeConfig;
  children: ReactNode;
}

export function LocaleProvider({ config, children }: LocaleProviderProps) {
  const initialize = useLocaleStore((state) => state.initialize);
  const pathname = usePathname();
  const routeLocale = localeFromPath(pathname, config.locales, config.defaultLocale);

  useEffect(() => {
    initialize(config, routeLocale);
  }, [initialize, config, routeLocale]);

  return <>{children}</>;
}
