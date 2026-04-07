import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseCodeListCsv, buildIndustryMap } from './edinet-codelist.js';

export function loadCodeListFromCache(cachePath) {
  if (!existsSync(cachePath)) {
    return new Map();
  }

  const csvText = readFileSync(cachePath, 'utf-8');
  const companies = parseCodeListCsv(csvText);
  return buildIndustryMap(companies);
}

export function saveCodeListCache(cachePath, csvText) {
  writeFileSync(cachePath, csvText, 'utf-8');
}
