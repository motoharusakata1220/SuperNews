import { UnDataCollector } from './un-data';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UnDataCollector', () => {
  let collector: UnDataCollector;

  beforeEach(() => {
    collector = new UnDataCollector();
    mockFetch.mockReset();
  });

  test('nameがUNDataである', () => {
    expect(collector.name).toBe('UNData');
  });

  test('UN SDG APIレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = [
      {
        geoAreaCode: '392',
        geoAreaName: 'Japan',
        timePeriodStart: 2023,
        value: '0.925',
      },
      {
        geoAreaCode: '840',
        geoAreaName: 'United States of America',
        timePeriodStart: 2023,
        value: '0.921',
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const japan = results.find((r) => r.country === 'Japan');

    expect(japan).toBeDefined();
    expect(japan!.value).toBe(0.925);
    expect(japan!.source).toBe('UNData');
    expect(japan!.date).toBe('2023');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('空データの場合は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
