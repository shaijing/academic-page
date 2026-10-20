import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import { renderHome } from '@/lib/homePage';

export default function Home() {
  const runtimeI18n = getRuntimeI18nConfig(getConfig().i18n);
  return renderHome(runtimeI18n.defaultLocale);
}
