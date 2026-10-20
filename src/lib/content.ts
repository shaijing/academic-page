import fs from 'fs';
import path from 'path';
import { parseToml } from '@/lib/toml';

const DEFAULT_CONTENT_DIR = 'content';

function normalizeLocale(locale: string): string {
  return locale.trim().replace('_', '-').toLowerCase();
}

function getCandidateFilePaths(filename: string, locale?: string): string[] {
  const candidates: string[] = [];

  if (locale) {
    candidates.push(path.join(process.cwd(), `${DEFAULT_CONTENT_DIR}_${normalizeLocale(locale)}`, filename));
  }

  candidates.push(path.join(process.cwd(), DEFAULT_CONTENT_DIR, filename));

  return candidates;
}

function readFirstAvailableFile(filename: string, locale?: string): string {
  const candidates = getCandidateFilePaths(filename, locale);

  for (const filePath of candidates) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  throw new Error(`Missing content file \"${filename}\"${locale ? ` for locale \"${locale}\"` : ''} in ${candidates.join(' or ')}`);
}

export function getMarkdownContent(filename: string, locale?: string): string {
  return readFirstAvailableFile(filename, locale);
}

export function getBibtexContent(filename: string, locale?: string): string {
  return readFirstAvailableFile(filename, locale);
}

export function getTomlContent<T>(filename: string, locale?: string): T | null {
  const content = readFirstAvailableFile(filename, locale);
  if (!content) {
    return null;
  }

  try {
    return parseToml<T>(content);
  } catch (error) {
    throw new Error(`Failed to parse TOML file \"${filename}\": ${String(error)}`);
  }
}

export function getPageConfig<T = unknown>(pageName: string, locale?: string): T | null {
  if (!/^[a-z0-9_-]+$/i.test(pageName)) return null;
  const filename = `${pageName}.toml`;
  if (!getCandidateFilePaths(filename, locale).some((filePath) => fs.existsSync(filePath))) {
    return null;
  }
  return getTomlContent<T>(filename, locale);
}
