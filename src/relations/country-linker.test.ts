import { linkCountries } from './country-linker';
import { NewsArticleWithId } from './types';

function makeArticle(overrides: Partial<NewsArticleWithId> & { id: string }): NewsArticleWithId {
  return {
    title: '',
    description: '',
    url: 'https://example.com',
    publishedAt: '2026-04-01T00:00:00Z',
    source: 'test',
    category: '世界情勢',
    ...overrides,
  };
}

describe('linkCountries', () => {
  it('空配列のとき空の関係リストを返す', () => {
    const result = linkCountries([]);
    expect(result).toEqual([]);
  });

  it('1つの記事に2国が含まれる場合に関係が検出される', () => {
    const articles = [
      makeArticle({ id: '1', title: '米中貿易交渉が再開' }),
    ];
    const result = linkCountries(articles);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const rel = result[0];
    expect([rel.countryA, rel.countryB].sort()).toEqual(['CHN', 'USA']);
  });

  it('制裁キーワードがある場合は制裁タイプで負のstrength', () => {
    const articles = [
      makeArticle({ id: '1', title: 'アメリカがロシアに追加制裁を発動' }),
    ];
    const result = linkCountries(articles);
    const sanction = result.find(r => r.relationType === '制裁');
    expect(sanction).toBeDefined();
    expect(sanction!.strength).toBeLessThan(0);
  });

  it('同盟キーワードがある場合は同盟タイプで正のstrength', () => {
    const articles = [
      makeArticle({ id: '1', title: '日米同盟の強化で合意' }),
    ];
    const result = linkCountries(articles);
    const alliance = result.find(r => r.relationType === '同盟');
    expect(alliance).toBeDefined();
    expect(alliance!.strength).toBeGreaterThan(0);
  });

  it('貿易キーワードがある場合は貿易タイプになる', () => {
    const articles = [
      makeArticle({ id: '1', title: 'ブラジルとインドネシアが貿易協定を締結' }),
    ];
    const result = linkCountries(articles);
    const trade = result.find(r => r.relationType === '貿易');
    expect(trade).toBeDefined();
  });

  it('複数記事から同じ国ペアの関係は集約される', () => {
    const articles = [
      makeArticle({ id: '1', title: '日米首脳会談で防衛協力を確認' }),
      makeArticle({ id: '2', title: '日米が経済安全保障で連携強化' }),
    ];
    const result = linkCountries(articles);
    const jpUs = result.filter(r =>
      [r.countryA, r.countryB].sort().join('-') === 'JPN-USA'
    );
    expect(jpUs.length).toBe(1);
    expect(jpUs[0].sourceArticleIds.length).toBe(2);
  });

  it('国名が含まれない記事からは関係が抽出されない', () => {
    const articles = [
      makeArticle({ id: '1', title: '新しいプログラミング言語が登場' }),
    ];
    const result = linkCountries(articles);
    expect(result).toEqual([]);
  });

  it('sourceArticleIdsに元記事のIDが含まれる', () => {
    const articles = [
      makeArticle({ id: 'art-42', title: 'フランスとドイツがEU改革で共同声明' }),
    ];
    const result = linkCountries(articles);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].sourceArticleIds).toContain('art-42');
  });

  it('updatedAtがISO形式の日時文字列である', () => {
    const articles = [
      makeArticle({ id: '1', title: '英国とインドの通商協議が進展' }),
    ];
    const result = linkCountries(articles);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(() => new Date(result[0].updatedAt)).not.toThrow();
    expect(new Date(result[0].updatedAt).toISOString()).toBe(result[0].updatedAt);
  });
});
