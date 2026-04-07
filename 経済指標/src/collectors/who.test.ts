import { WhoCollector } from './who';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WhoCollector', () => {
  let collector: WhoCollector;

  beforeEach(() => {
    collector = new WhoCollector();
    mockFetch.mockReset();
  });

  test('nameがWHOである', () => {
    expect(collector.name).toBe('WHO');
  });

  test('GHO ODataレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      value: [
        {
          SpatialDim: 'JPN',
          TimeDim: 2022,
          NumericValue: 74.1,
        },
        {
          SpatialDim: 'USA',
          TimeDim: 2022,
          NumericValue: 66.1,
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const japan = results.find((r) => r.countryCode === 'JPN');

    expect(japan).toBeDefined();
    expect(japan!.value).toBe(74.1);
    expect(japan!.source).toBe('WHO');
    expect(japan!.date).toBe('2022');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('空データの場合は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] }),
    });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
