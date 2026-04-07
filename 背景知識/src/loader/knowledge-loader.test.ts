import { loadKnowledgeFiles, assembleKnowledgeBase } from './knowledge-loader';
import type { KnowledgeEntry, CountryContext, ThemeBackground } from '../types';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  statSync: jest.fn(),
}));

const fs = require('fs');

const USA_CONTEXT: CountryContext = {
  category: '国別コンテキスト',
  countryCode: 'USA',
  politicalSystem: '大統領制連邦共和国',
  economicStructure: 'サービス業中心',
  historicalBackground: '1776年独立',
  alliances: ['NATO'],
  tensions: ['米中対立'],
  updatedAt: '2026-04-05',
};

const NATO_THEME: ThemeBackground = {
  category: 'テーマ別背景',
  themeId: 'nato-expansion',
  title: 'NATO拡大',
  summary: '冷戦後の東方拡大',
  detail: '詳細テキスト',
  relatedCountries: ['USA', 'DEU'],
  tags: ['軍事', '同盟'],
  updatedAt: '2026-04-05',
};

describe('loadKnowledgeFiles', () => {
  beforeEach(() => jest.resetAllMocks());

  it('再帰的にJSONファイルを読み込みエントリ配列を返す', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockImplementation((dir: string) => {
      if (dir.endsWith('knowledge')) return ['国別'];
      if (dir.endsWith('国別')) return ['USA.json'];
      return [];
    });
    fs.statSync.mockImplementation((p: string) => ({
      isDirectory: () => !p.endsWith('.json'),
    }));
    fs.readFileSync.mockReturnValue(JSON.stringify(USA_CONTEXT));

    const entries = loadKnowledgeFiles('/root/knowledge');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(USA_CONTEXT);
  });

  it('無効なJSONファイルはスキップする', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['bad.json']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });
    fs.readFileSync.mockReturnValue('{ invalid json');

    const entries = loadKnowledgeFiles('/root/knowledge');
    expect(entries).toHaveLength(0);
  });

  it('バリデーション失敗のエントリはスキップする', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['invalid.json']);
    fs.statSync.mockReturnValue({ isDirectory: () => false });
    fs.readFileSync.mockReturnValue(JSON.stringify({ category: '不明' }));

    const entries = loadKnowledgeFiles('/root/knowledge');
    expect(entries).toHaveLength(0);
  });

  it('ディレクトリが存在しないとき空配列を返す', () => {
    fs.existsSync.mockReturnValue(false);
    const entries = loadKnowledgeFiles('/nonexistent');
    expect(entries).toHaveLength(0);
  });
});

describe('assembleKnowledgeBase', () => {
  it('エントリをカテゴリ別に集約してKnowledgeBaseを返す', () => {
    const entries: KnowledgeEntry[] = [USA_CONTEXT, NATO_THEME];
    const kb = assembleKnowledgeBase(entries);

    expect(kb.countryContexts['USA']).toEqual(USA_CONTEXT);
    expect(kb.themeBackgrounds).toHaveLength(1);
    expect(kb.themeBackgrounds[0]).toEqual(NATO_THEME);
    expect(kb.economicHistory).toHaveLength(0);
    expect(kb.timelines).toHaveLength(0);
    expect(kb.generatedAt).toBeDefined();
  });

  it('空のエントリ配列で空のKnowledgeBaseを返す', () => {
    const kb = assembleKnowledgeBase([]);
    expect(Object.keys(kb.countryContexts)).toHaveLength(0);
    expect(kb.themeBackgrounds).toHaveLength(0);
  });
});
