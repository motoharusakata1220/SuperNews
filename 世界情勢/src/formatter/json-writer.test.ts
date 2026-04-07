import * as fs from 'fs';
import { writeCategoryFiles } from './json-writer';
import { NewsArticle, CategoryGrouped } from '../types';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

const makeArticle = (title: string, category: string): NewsArticle => ({
  title,
  description: '説明',
  url: `https://example.com/${title}`,
  publishedAt: '2026-04-04T00:00:00.000Z',
  source: 'Test',
  category: category as NewsArticle['category'],
});

describe('writeCategoryFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('カテゴリごとにJSONファイルを書き出す', () => {
    const grouped: CategoryGrouped = {
      '経済ニュース': [makeArticle('GDP', '経済ニュース')],
      '世界情勢': [makeArticle('Summit', '世界情勢')],
    };

    writeCategoryFiles(grouped, '/tmp/output');

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/tmp/output', { recursive: true });
    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(2);
  });

  test('出力JSONにメタデータが含まれる', () => {
    const grouped: CategoryGrouped = {
      '経済ニュース': [makeArticle('GDP', '経済ニュース')],
    };

    writeCategoryFiles(grouped, '/tmp/output');

    const writtenContent = JSON.parse(
      (mockedFs.writeFileSync as jest.Mock).mock.calls[0][1] as string,
    );

    expect(writtenContent).toHaveProperty('generatedAt');
    expect(writtenContent).toHaveProperty('category', '経済ニュース');
    expect(writtenContent).toHaveProperty('count', 1);
    expect(writtenContent).toHaveProperty('articles');
    expect(writtenContent.articles).toHaveLength(1);
  });

  test('空のカテゴリグループではファイルを書き出さない', () => {
    writeCategoryFiles({}, '/tmp/output');

    expect(mockedFs.mkdirSync).toHaveBeenCalled();
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });
});
