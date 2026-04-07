import { linkNews } from './news-linker';
import { NewsArticleWithId, NewsRelation } from './types';

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

describe('linkNews', () => {
  it('空配列のとき空の関係リストを返す', () => {
    const result = linkNews([]);
    expect(result).toEqual([]);
  });

  it('記事が1件のみのとき空の関係リストを返す', () => {
    const articles = [makeArticle({ id: '1', title: 'テスト記事' })];
    const result = linkNews(articles);
    expect(result).toEqual([]);
  });

  it('同じ国名を含む記事同士が関連として検出される', () => {
    const articles = [
      makeArticle({ id: '1', title: 'ウクライナの停戦交渉が進展' }),
      makeArticle({ id: '2', title: 'ウクライナへの人道支援が拡大' }),
    ];
    const result = linkNews(articles);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].relationType).toBe('関連');
    expect(result[0].sourceId).toBe('1');
    expect(result[0].targetId).toBe('2');
  });

  it('共通キーワードがない記事同士は関係が検出されない', () => {
    const articles = [
      makeArticle({ id: '1', title: 'Apple新型iPhoneを発表' }),
      makeArticle({ id: '2', title: 'ブラジルの農業生産が増加' }),
    ];
    const result = linkNews(articles);
    expect(result).toEqual([]);
  });

  it('因果関係キーワードがある場合は因果関係として検出される', () => {
    const articles = [
      makeArticle({ id: '1', title: 'サウジアラビアの原油価格が急騰', publishedAt: '2026-04-01T00:00:00Z' }),
      makeArticle({ id: '2', title: 'サウジアラビアの原油価格高騰を受けてインフレが加速', publishedAt: '2026-04-02T00:00:00Z' }),
    ];
    const result = linkNews(articles);
    const causal = result.find(r => r.relationType === '因果関係');
    expect(causal).toBeDefined();
  });

  it('対立キーワードがある場合は対立として検出される', () => {
    const articles = [
      makeArticle({ id: '1', title: 'アメリカと中国の貿易戦争が激化、報復関税を発動' }),
      makeArticle({ id: '2', title: '中国がアメリカに対抗措置、貿易摩擦深刻化' }),
    ];
    const result = linkNews(articles);
    const conflict = result.find(r => r.relationType === '対立');
    expect(conflict).toBeDefined();
  });

  it('confidenceが0〜1の範囲内である', () => {
    const articles = [
      makeArticle({ id: '1', title: 'NATO同盟国が防衛費増額を決定' }),
      makeArticle({ id: '2', title: 'NATO加盟国の軍事演習が開始' }),
    ];
    const result = linkNews(articles);
    for (const rel of result) {
      expect(rel.confidence).toBeGreaterThanOrEqual(0);
      expect(rel.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('descriptionの共通キーワードも考慮される', () => {
    const articles = [
      makeArticle({ id: '1', title: '新政策発表', description: 'サウジアラビアが原油減産を決定' }),
      makeArticle({ id: '2', title: '市場動向', description: 'サウジアラビアの減産で原油先物が上昇' }),
    ];
    const result = linkNews(articles);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
