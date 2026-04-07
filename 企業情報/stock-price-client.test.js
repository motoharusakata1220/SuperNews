import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStockPrices, parseStooqCsv } from './stock-price-client.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const SAMPLE_STOOQ_CSV = `Date,Open,High,Low,Close,Volume
2026-04-01,1500,1520,1490,1510,1000000
2026-04-02,1510,1530,1500,1525,1200000
2026-04-03,1525,1540,1515,1535,900000`;

describe('parseStooqCsv', () => {
  it('Stooq CSVを日付と終値の配列にパースする', () => {
    const result = parseStooqCsv(SAMPLE_STOOQ_CSV);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2026-04-01', close: 1510 });
    expect(result[2]).toEqual({ date: '2026-04-03', close: 1535 });
  });

  it('空のCSVのとき空配列を返す', () => {
    expect(parseStooqCsv('')).toEqual([]);
  });
});

describe('fetchStockPrices', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('証券コードで株価データを取得できる', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_STOOQ_CSV
    });

    const result = await fetchStockPrices('7203');

    expect(result).toHaveLength(3);
    expect(result[0].close).toBe(1510);
  });

  it('APIエラーのとき空配列を返す（個別銘柄エラーで全体を止めない）', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await fetchStockPrices('9999');
    expect(result).toEqual([]);
  });
});
