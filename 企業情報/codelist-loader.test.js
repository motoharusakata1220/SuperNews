import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadCodeListFromCache, saveCodeListCache } from './codelist-loader.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

const SAMPLE_CSV = `"EDINETコード","提出者種別","上場区分","連結の有無","資本金","決算期","提出者名","提出者名（英字）","提出者名（カナ）","所在地","提出者業種","証券コード","提出者法人番号"
"E00001","内国法人・組合","上場","有","100000000","3","テスト株式会社","Test Inc","テスト","東京都","情報・通信業","1234","1234567890123"
"E00002","内国法人・組合","上場","有","500000000","3","サンプル工業","Sample Ind","サンプル","大阪府","輸送用機器","5678","9876543210987"`;

describe('loadCodeListFromCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('キャッシュファイルが存在するとき業種マップを返す', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(SAMPLE_CSV);

    const map = loadCodeListFromCache('/path/to/cache.csv');

    expect(map.size).toBe(2);
    expect(map.get('E00001')).toEqual({
      name: 'テスト株式会社',
      securityCode: '1234',
      industry: '情報・通信業',
    });
    expect(map.get('E00002')).toEqual({
      name: 'サンプル工業',
      securityCode: '5678',
      industry: '輸送用機器',
    });
  });

  it('キャッシュファイルが存在しないとき空のMapを返す', () => {
    existsSync.mockReturnValue(false);

    const map = loadCodeListFromCache('/path/to/cache.csv');

    expect(map.size).toBe(0);
    expect(readFileSync).not.toHaveBeenCalled();
  });
});

describe('saveCodeListCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('CSVテキストをファイルに保存する', () => {
    saveCodeListCache('/path/to/cache.csv', SAMPLE_CSV);

    expect(writeFileSync).toHaveBeenCalledWith('/path/to/cache.csv', SAMPLE_CSV, 'utf-8');
  });
});
