import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

const root = process.cwd();
const baseDir = path.join(root, 'content');
const isString = (value) => typeof value === 'string' && value.trim().length > 0;
const fail = (file, message) => { throw new Error(`${file}: ${message}`); };

function readToml(file) {
  try {
    return parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(file, error.message);
  }
}

function requireString(value, file, field) {
  if (!isString(value)) fail(file, `${field} must be a nonempty string`);
}

function contentFile(filename, locale) {
  if (!isString(filename) || filename !== path.basename(filename)) {
    fail('content', `invalid source filename: ${String(filename)}`);
  }
  const localized = path.join(root, `content_${locale}`, filename);
  const fallback = path.join(baseDir, filename);
  const file = fs.existsSync(localized) ? localized : fallback;
  if (!fs.existsSync(file)) fail(file, 'referenced content file is missing');
  return file;
}

function validatePage(page, file, locale) {
  requireString(page.title, file, 'title');
  if (!['about', 'publication', 'text', 'card'].includes(page.type)) {
    fail(file, `unsupported page type: ${String(page.type)}`);
  }
  if (page.type === 'text' || page.type === 'publication') {
    contentFile(page.source, locale);
  }
  if (page.type === 'card') {
    if (!Array.isArray(page.items)) fail(file, 'items must be an array');
    page.items.forEach((item, index) => requireString(item.title, file, `items[${index}].title`));
  }
  if (page.type === 'about') {
    if (!Array.isArray(page.sections)) fail(file, 'sections must be an array');
    page.sections.forEach((section, index) => {
      const field = `sections[${index}]`;
      requireString(section.id, file, `${field}.id`);
      if (!['markdown', 'publications', 'list'].includes(section.type)) {
        fail(file, `${field}.type is unsupported`);
      }
      if (section.type === 'markdown' || section.type === 'list') {
        const source = contentFile(section.source, locale);
        if (section.type === 'list') readToml(source);
      }
      if (section.type === 'publications') contentFile('publications.bib', locale);
    });
  }
}

const baseConfigFile = path.join(baseDir, 'config.toml');
const base = readToml(baseConfigFile);
for (const [group, fields] of Object.entries({
  site: ['title', 'description', 'favicon'],
  author: ['name', 'title', 'institution', 'avatar'],
})) {
  if (!base[group] || typeof base[group] !== 'object') fail(baseConfigFile, `${group} is required`);
  for (const field of fields) requireString(base[group][field], baseConfigFile, `${group}.${field}`);
}
if (!base.features || typeof base.features.enable_likes !== 'boolean') {
  fail(baseConfigFile, 'features.enable_likes must be a boolean');
}
if (!Array.isArray(base.navigation) || base.navigation.length === 0) {
  fail(baseConfigFile, 'navigation must be a nonempty array');
}
const locales = base.i18n?.enabled ? base.i18n.locales : [base.i18n?.default_locale || 'en'];
if (!Array.isArray(locales) || locales.some((locale) => !/^[a-z]{2}(?:-[a-z]{2})?$/i.test(locale))) {
  fail(baseConfigFile, 'i18n.locales must contain valid locale codes');
}

for (const locale of locales) {
  const localizedConfigFile = path.join(root, `content_${locale}`, 'config.toml');
  const localized = fs.existsSync(localizedConfigFile) ? readToml(localizedConfigFile) : {};
  const navigation = localized.navigation || base.navigation;
  if (!Array.isArray(navigation)) fail(localizedConfigFile, 'navigation must be an array');
  const seenTargets = new Set();
  for (const item of navigation) {
    requireString(item.title, localizedConfigFile, 'navigation.title');
    if (!['page', 'section', 'link'].includes(item.type)) fail(localizedConfigFile, 'invalid navigation.type');
    if (item.type !== 'page') continue;
    if (!/^[a-z0-9_-]+$/i.test(item.target)) fail(localizedConfigFile, `invalid navigation target: ${String(item.target)}`);
    if (seenTargets.has(item.target)) fail(localizedConfigFile, `duplicate navigation target: ${item.target}`);
    if (item.target !== 'about' && locales.includes(item.target)) {
      fail(localizedConfigFile, `navigation target conflicts with locale path: ${item.target}`);
    }
    seenTargets.add(item.target);
    const pageFile = contentFile(`${item.target}.toml`, locale);
    validatePage(readToml(pageFile), pageFile, locale);
  }
}

console.log(`Validated content for ${locales.join(', ')}`);
