import type {
  KnowledgeEntry,
  CountryContext,
  ThemeBackground,
  EconomicHistoryEntry,
  CurrentEventsTimeline,
} from '../types';

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function hasStrings(obj: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((k) => typeof obj[k] === 'string');
}

function hasArrays(obj: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((k) => Array.isArray(obj[k]));
}

export function isCountryContext(v: unknown): v is CountryContext {
  if (!isObject(v) || v.category !== '国別コンテキスト') return false;
  return (
    hasStrings(v, ['countryCode', 'politicalSystem', 'economicStructure', 'historicalBackground', 'updatedAt']) &&
    hasArrays(v, ['alliances', 'tensions'])
  );
}

export function isThemeBackground(v: unknown): v is ThemeBackground {
  if (!isObject(v) || v.category !== 'テーマ別背景') return false;
  return (
    hasStrings(v, ['themeId', 'title', 'summary', 'detail', 'updatedAt']) &&
    hasArrays(v, ['relatedCountries', 'tags'])
  );
}

export function isEconomicHistoryEntry(v: unknown): v is EconomicHistoryEntry {
  if (!isObject(v) || v.category !== '経済史') return false;
  return (
    hasStrings(v, ['eventId', 'title', 'period', 'summary', 'updatedAt']) &&
    hasArrays(v, ['causes', 'impacts', 'relatedCountries', 'timeline'])
  );
}

export function isCurrentEventsTimeline(v: unknown): v is CurrentEventsTimeline {
  if (!isObject(v) || v.category !== 'タイムライン') return false;
  return (
    hasStrings(v, ['timelineId', 'title', 'summary', 'updatedAt']) &&
    hasArrays(v, ['events', 'relatedCountries'])
  );
}

export function validateEntry(v: unknown): KnowledgeEntry | null {
  if (isCountryContext(v)) return v;
  if (isThemeBackground(v)) return v;
  if (isEconomicHistoryEntry(v)) return v;
  if (isCurrentEventsTimeline(v)) return v;
  return null;
}
