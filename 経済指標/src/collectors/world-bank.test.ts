import { WorldBankCollector } from './world-bank';
import { EconomicIndicator } from '../types';

// fetch をモック（外部API依存）
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WorldBankCollector', () => {
  let collector: WorldBankCollector;

  beforeEach(() => {
    collector = new WorldBankCollector();
    mockFetch.mockReset();
  });

  test('nameがWorldBankである', () => {
    expect(collector.name).toBe('WorldBank');
  });

  test('APIレスポンスを正規化された形式に変換できる', async () => {
    // World Bank APIは [metadata, data[]] の形式で返す
    const mockResponse = [
      { page: 1, pages: 1, total: 1 },
      [
        {
          country: { id: 'JP', value: 'Japan' },
          indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' },
          date: '2023',
          value: 4212945700000,
        },
      ],
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();

    const japanGdp = results.find(
      (r) => r.countryCode === 'JP' && r.indicatorCode === 'NY.GDP.MKTP.CD'
    );

    expect(japanGdp).toBeDefined();
    expect(japanGdp!.country).toBe('Japan');
    expect(japanGdp!.indicator).toBe('GDP（名目、USドル）');
    expect(japanGdp!.value).toBe(4212945700000);
    expect(japanGdp!.date).toBe('2023');
    expect(japanGdp!.source).toBe('WorldBank');
    expect(japanGdp!.frequency).toBe('年次');
    expect(japanGdp!.unit).toBe('USドル');
  });

  test('valueがnullのデータも含める', async () => {
    const mockResponse = [
      { page: 1, pages: 1, total: 1 },
      [
        {
          country: { id: 'US', value: 'United States' },
          indicator: { id: 'NY.GDP.MKTP.CD', value: 'GDP (current US$)' },
          date: '2024',
          value: null,
        },
      ],
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const usGdp = results.find(
      (r) => r.countryCode === 'US' && r.date === '2024'
    );

    expect(usGdp).toBeDefined();
    expect(usGdp!.value).toBeNull();
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('データが空の場合は空配列を返す', async () => {
    const mockResponse = [
      { page: 1, pages: 1, total: 0 },
      null,
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
