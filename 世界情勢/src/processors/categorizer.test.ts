import { categorize, categorizeAll } from './categorizer';
import { RawArticle, NewsArticle } from '../types';

const makeRaw = (title: string, description: string = ''): RawArticle => ({
  title,
  description,
  url: 'https://example.com/test',
  publishedAt: '2026-04-04T00:00:00.000Z',
  source: 'Test',
});

describe('categorize', () => {
  test('経済関連のキーワードを含む記事を経済ニュースに分類する', () => {
    expect(categorize(makeRaw('GDP growth slows down'))).toBe('経済ニュース');
    expect(categorize(makeRaw('株価が急落'))).toBe('経済ニュース');
    expect(categorize(makeRaw('', 'inflation rate rises'))).toBe('経済ニュース');
  });

  test('紛争関連のキーワードを含む記事を地域紛争に分類する', () => {
    expect(categorize(makeRaw('Military conflict escalates'))).toBe('地域紛争');
    expect(categorize(makeRaw('紛争地帯から避難'))).toBe('地域紛争');
  });

  test('テクノロジー関連のキーワードを含む記事をテクノロジーに分類する', () => {
    expect(categorize(makeRaw('AI breakthrough announced'))).toBe('テクノロジー');
    expect(categorize(makeRaw('半導体不足が深刻化'))).toBe('テクノロジー');
  });

  test('外交・政治関連の記事を世界情勢に分類する', () => {
    expect(categorize(makeRaw('Summit between leaders'))).toBe('世界情勢');
    expect(categorize(makeRaw('国連総会で演説'))).toBe('世界情勢');
  });

  test('どのカテゴリにも該当しない場合はその他になる', () => {
    expect(categorize(makeRaw('Local festival held'))).toBe('その他');
  });
});

describe('categorizeAll', () => {
  test('RawArticle配列をNewsArticle配列に変換する', () => {
    const raws: RawArticle[] = [
      makeRaw('GDP rises sharply'),
      makeRaw('AI startup funding'),
    ];

    const result = categorizeAll(raws);

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('経済ニュース');
    expect(result[1].category).toBe('テクノロジー');
  });
});
