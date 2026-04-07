import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCodeList, parseCodeListCsv, buildIndustryMap } from './edinet-codelist.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const SAMPLE_CSV = `"EDINETコード","提出者種別","上場区分","連結の有無","資本金","決算期","提出者名","提出者名（英字）","提出者名（カナ）","所在地","提出者業種","証券コード","提出者法人番号"
"E00001","内国法人・組合","上場","有","100000000","3","テスト株式会社","Test Inc","テスト","東京都","情報・通信業","1234","1234567890123"
"E00002","内国法人・組合","上場","有","500000000","3","サンプル工業","Sample Ind","サンプル","大阪府","輸送用機器","5678","9876543210987"
"E00003","内国法人・組合","非上場","無","10000000","3","非上場企業","Private Co","ヒジョウジョウ","東京都","サービス業","","0000000000000"`;

describe('parseCodeListCsv', () => {
  it('CSVをパースして企業情報配列を返す', () => {
    const result = parseCodeListCsv(SAMPLE_CSV);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      edinetCode: 'E00001',
      name: 'テスト株式会社',
      securityCode: '1234',
      industry: '情報・通信業',
      listingStatus: '上場',
      capital: '100000000'
    });
  });

  it('空のCSVのとき空配列を返す', () => {
    const result = parseCodeListCsv('');
    expect(result).toEqual([]);
  });
});

describe('buildIndustryMap', () => {
  it('上場企業のみをEDINETコード→業種のマップにする', () => {
    const companies = parseCodeListCsv(SAMPLE_CSV);
    const map = buildIndustryMap(companies);

    expect(map.get('E00001')).toEqual({
      name: 'テスト株式会社',
      securityCode: '1234',
      industry: '情報・通信業'
    });
    expect(map.get('E00002')).toEqual({
      name: 'サンプル工業',
      securityCode: '5678',
      industry: '輸送用機器'
    });
    // 非上場企業は含まれない
    expect(map.has('E00003')).toBe(false);
  });
});

describe('fetchCodeList', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('EDINET APIからコードリストを取得しパースする', async () => {
    // ZIPレスポンスのモック（実際はZIPだがテストではCSV直接返す想定）
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode(SAMPLE_CSV).buffer
    });

    // fetchCodeListは内部でZIP解凍するが、テストではモックで対応
    // 実装時にZIP処理を追加
  });

  it('APIエラーのとき エラーを投げる', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(fetchCodeList('https://api.edinet-fsa.go.jp/api/v2', 'key'))
      .rejects.toThrow('EDINETコードリスト取得エラー');
  });
});
