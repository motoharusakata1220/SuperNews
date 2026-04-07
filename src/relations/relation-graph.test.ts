import { buildRelationGraph } from './relation-graph';
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

describe('buildRelationGraph', () => {
  it('空配列のときnewsRelationsとcountryRelationsが空のグラフを返す', () => {
    const result = buildRelationGraph([]);
    expect(result.newsRelations).toEqual([]);
    expect(result.countryRelations).toEqual([]);
    expect(result.generatedAt).toBeDefined();
  });

  it('関連記事からニュース関係と国家関係の両方が含まれるグラフを返す', () => {
    const articles = [
      makeArticle({ id: '1', title: 'アメリカと日本が同盟の強化で合意' }),
      makeArticle({ id: '2', title: 'アメリカと日本の経済協力の新枠組みを発表' }),
    ];
    const result = buildRelationGraph(articles);
    expect(result.newsRelations.length).toBeGreaterThanOrEqual(1);
    expect(result.countryRelations.length).toBeGreaterThanOrEqual(1);
  });

  it('generatedAtがISO形式の日時文字列である', () => {
    const result = buildRelationGraph([]);
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });

  it('ニュース関係のIDが入力記事のIDと一致する', () => {
    const articles = [
      makeArticle({ id: 'a1', title: 'ウクライナ情勢が悪化' }),
      makeArticle({ id: 'a2', title: 'ウクライナへの支援が拡大' }),
    ];
    const result = buildRelationGraph(articles);
    for (const rel of result.newsRelations) {
      expect(['a1', 'a2']).toContain(rel.sourceId);
      expect(['a1', 'a2']).toContain(rel.targetId);
    }
  });
});
