import * as fs from 'fs';
import * as path from 'path';
import type { KnowledgeEntry, KnowledgeBase } from '../types';
import { validateEntry } from '../validator/schema-validator';

export function loadKnowledgeFiles(knowledgeDir: string): KnowledgeEntry[] {
  if (!fs.existsSync(knowledgeDir)) return [];

  const entries: KnowledgeEntry[] = [];
  scanDirectory(knowledgeDir, entries);
  return entries;
}

function scanDirectory(dir: string, entries: KnowledgeEntry[]): void {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, entries);
    } else if (item.endsWith('.json')) {
      const entry = loadJsonFile(fullPath);
      if (entry) entries.push(entry);
    }
  }
}

function loadJsonFile(filePath: string): KnowledgeEntry | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return validateEntry(parsed);
  } catch {
    return null;
  }
}

export function assembleKnowledgeBase(entries: KnowledgeEntry[]): KnowledgeBase {
  const countryContexts: Record<string, KnowledgeEntry & { category: '国別コンテキスト' }> = {};
  const themeBackgrounds: (KnowledgeEntry & { category: 'テーマ別背景' })[] = [];
  const economicHistory: (KnowledgeEntry & { category: '経済史' })[] = [];
  const timelines: (KnowledgeEntry & { category: 'タイムライン' })[] = [];

  for (const entry of entries) {
    switch (entry.category) {
      case '国別コンテキスト':
        countryContexts[entry.countryCode] = entry;
        break;
      case 'テーマ別背景':
        themeBackgrounds.push(entry);
        break;
      case '経済史':
        economicHistory.push(entry);
        break;
      case 'タイムライン':
        timelines.push(entry);
        break;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    countryContexts,
    themeBackgrounds,
    economicHistory,
    timelines,
  };
}
