import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

const root = process.cwd();
const config = parse(fs.readFileSync(path.join(root, 'content/config.toml'), 'utf8'));
const defaultLocale = config.i18n?.default_locale || 'en';
const locales = config.i18n?.enabled ? config.i18n.locales : [defaultLocale];

function updateHtmlFiles(dir, locale) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateHtmlFiles(file, locale);
    } else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const updated = html.replace(/(<html\s+lang=")[^"]+("\s)/, `$1${locale}$2`);
      if (updated === html) throw new Error(`Could not set HTML language in ${file}`);
      fs.writeFileSync(file, updated);
    }
  }
}

for (const locale of locales) {
  if (locale === defaultLocale) continue;
  const dir = path.join(root, 'out', locale);
  if (!fs.existsSync(dir)) throw new Error(`Missing localized export directory: ${dir}`);
  updateHtmlFiles(dir, locale);
}
