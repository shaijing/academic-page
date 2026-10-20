export function localeFromPath(pathname: string, locales: string[], defaultLocale: string): string {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment && locales.includes(firstSegment) && firstSegment !== defaultLocale
    ? firstSegment
    : defaultLocale;
}

export function localizedPath(pathname: string, locale: string, locales: string[], defaultLocale: string): string {
  const currentLocale = localeFromPath(pathname, locales, defaultLocale);
  const prefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const unprefixed = prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))
    ? pathname.slice(prefix.length) || '/'
    : pathname;
  return locale === defaultLocale ? unprefixed : `/${locale}${unprefixed === '/' ? '' : unprefixed}`;
}
