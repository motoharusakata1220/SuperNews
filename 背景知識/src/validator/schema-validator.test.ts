import {
  isCountryContext,
  isThemeBackground,
  isEconomicHistoryEntry,
  isCurrentEventsTimeline,
  validateEntry,
} from './schema-validator';

describe('isCountryContext', () => {
  it('有効な国別コンテキストのときtrueを返す', () => {
    const valid = {
      category: '国別コンテキスト',
      countryCode: 'USA',
      politicalSystem: '大統領制連邦共和国',
      economicStructure: 'サービス業中心の混合経済',
      historicalBackground: '1776年独立',
      alliances: ['NATO', 'AUKUS'],
      tensions: ['米中対立'],
      updatedAt: '2026-04-05',
    };
    expect(isCountryContext(valid)).toBe(true);
  });

  it('categoryが異なるときfalseを返す', () => {
    expect(isCountryContext({ category: 'テーマ別背景' })).toBe(false);
  });

  it('必須フィールドが欠けているときfalseを返す', () => {
    expect(isCountryContext({ category: '国別コンテキスト' })).toBe(false);
  });

  it('nullのときfalseを返す', () => {
    expect(isCountryContext(null)).toBe(false);
  });
});

describe('isThemeBackground', () => {
  it('有効なテーマ別背景のときtrueを返す', () => {
    const valid = {
      category: 'テーマ別背景',
      themeId: 'nato-expansion',
      title: 'NATO拡大',
      summary: '概要',
      detail: '詳細',
      relatedCountries: ['USA', 'DEU'],
      tags: ['軍事', '同盟'],
      updatedAt: '2026-04-05',
    };
    expect(isThemeBackground(valid)).toBe(true);
  });

  it('tagsが配列でないときfalseを返す', () => {
    expect(isThemeBackground({
      category: 'テーマ別背景',
      themeId: 'x', title: 'x', summary: 'x', detail: 'x',
      relatedCountries: [], tags: 'not-array', updatedAt: 'x',
    })).toBe(false);
  });
});

describe('isEconomicHistoryEntry', () => {
  it('有効な経済史エントリのときtrueを返す', () => {
    const valid = {
      category: '経済史',
      eventId: 'lehman-2008',
      title: 'リーマンショック',
      period: '2008-09 〜 2009-06',
      summary: '概要',
      causes: ['サブプライム'],
      impacts: ['世界同時不況'],
      relatedCountries: ['USA'],
      timeline: [{ date: '2008-09-15', title: '破綻', description: '詳細' }],
      updatedAt: '2026-04-05',
    };
    expect(isEconomicHistoryEntry(valid)).toBe(true);
  });
});

describe('isCurrentEventsTimeline', () => {
  it('有効なタイムラインのときtrueを返す', () => {
    const valid = {
      category: 'タイムライン',
      timelineId: 'ukraine-crisis',
      title: 'ウクライナ危機',
      summary: '概要',
      events: [{ date: '2022-02-24', title: '侵攻開始', description: '詳細' }],
      relatedCountries: ['UKR', 'RUS'],
      updatedAt: '2026-04-05',
    };
    expect(isCurrentEventsTimeline(valid)).toBe(true);
  });
});

describe('validateEntry', () => {
  it('有効なエントリのときエントリを返す', () => {
    const entry = {
      category: '国別コンテキスト',
      countryCode: 'JPN',
      politicalSystem: '議院内閣制',
      economicStructure: '製造業・サービス業中心',
      historicalBackground: '歴史',
      alliances: ['日米同盟'],
      tensions: [],
      updatedAt: '2026-04-05',
    };
    expect(validateEntry(entry)).toEqual(entry);
  });

  it('無効なエントリのときnullを返す', () => {
    expect(validateEntry({ category: '不明' })).toBeNull();
  });

  it('categoryが無いときnullを返す', () => {
    expect(validateEntry({ foo: 'bar' })).toBeNull();
  });
});
