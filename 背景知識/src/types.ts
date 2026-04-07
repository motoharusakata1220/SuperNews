export type KnowledgeCategory =
  | '国別コンテキスト'
  | 'テーマ別背景'
  | '経済史'
  | 'タイムライン';

export interface TimelineEvent {
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly relatedCountries?: readonly string[];
}

export interface CountryContext {
  readonly category: '国別コンテキスト';
  readonly countryCode: string;
  readonly politicalSystem: string;
  readonly economicStructure: string;
  readonly historicalBackground: string;
  readonly alliances: readonly string[];
  readonly tensions: readonly string[];
  readonly updatedAt: string;
}

export interface ThemeBackground {
  readonly category: 'テーマ別背景';
  readonly themeId: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly relatedCountries: readonly string[];
  readonly tags: readonly string[];
  readonly updatedAt: string;
}

export interface EconomicHistoryEntry {
  readonly category: '経済史';
  readonly eventId: string;
  readonly title: string;
  readonly period: string;
  readonly summary: string;
  readonly causes: readonly string[];
  readonly impacts: readonly string[];
  readonly relatedCountries: readonly string[];
  readonly timeline: readonly TimelineEvent[];
  readonly updatedAt: string;
}

export interface CurrentEventsTimeline {
  readonly category: 'タイムライン';
  readonly timelineId: string;
  readonly title: string;
  readonly summary: string;
  readonly events: readonly TimelineEvent[];
  readonly relatedCountries: readonly string[];
  readonly updatedAt: string;
}

export type KnowledgeEntry =
  | CountryContext
  | ThemeBackground
  | EconomicHistoryEntry
  | CurrentEventsTimeline;

export interface KnowledgeBase {
  readonly generatedAt: string;
  readonly countryContexts: Record<string, CountryContext>;
  readonly themeBackgrounds: readonly ThemeBackground[];
  readonly economicHistory: readonly EconomicHistoryEntry[];
  readonly timelines: readonly CurrentEventsTimeline[];
}
