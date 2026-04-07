import { deduplicate } from './deduplicator';
import { NewsArticle } from '../types';

const makeArticle = (
  title: string,
  url: string,
  source: string = 'Test',
): NewsArticle => ({
  title,
  description: '説明',
  url,
  publishedAt: '2026-04-04T00:00:00.000Z',
  source,
  category: '世界情勢',
});

describe('deduplicate', () => {
  test('同一URLの記事を除去する', () => {
    const articles = [
      makeArticle('記事A', 'https://example.com/1', 'NHK'),
      makeArticle('記事A（別ソース）', 'https://example.com/1', 'BBC'),
      makeArticle('記事B', 'https://example.com/2'),
    ];

    const result = deduplicate(articles);

    expect(result).toHaveLength(2);
    expect(result.map((a) => a.url)).toEqual([
      'https://example.com/1',
      'https://example.com/2',
    ]);
  });

  test('空配列のとき空配列を返す', () => {
    expect(deduplicate([])).toEqual([]);
  });

  test('重複がないときそのまま返す', () => {
    const articles = [
      makeArticle('記事A', 'https://example.com/1'),
      makeArticle('記事B', 'https://example.com/2'),
    ];

    const result = deduplicate(articles);
    expect(result).toHaveLength(2);
  });

  test('タイトルが酷似する記事も除去する', () => {
    const articles = [
      makeArticle('GDP成長率が低下', 'https://example.com/1'),
      makeArticle('GDP成長率が低下', 'https://example.com/2'),
      makeArticle('別のニュース', 'https://example.com/3'),
    ];

    const result = deduplicate(articles);
    expect(result).toHaveLength(2);
  });
});
