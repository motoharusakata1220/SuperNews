import { EurostatCollector } from './eurostat';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EurostatCollector', () => {
  let collector: EurostatCollector;

  beforeEach(() => {
    collector = new EurostatCollector();
    mockFetch.mockReset();
  });

  test('nameがEurostatである', () => {
    expect(collector.name).toBe('Eurostat');
  });

  test('Eurostat JSON APIレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      dimension: {
        geo: { category: { index: { DE: 0, FR: 1 }, label: { DE: 'Germany', FR: 'France' } } },
        time: { category: { index: { '2024M01': 0, '2024M02': 1 }, label: { '2024M01': '2024M01', '2024M02': '2024M02' } } },
      },
      value: { '0': 5.8, '1': 5.9, '2': 7.4, '3': 7.3 },
      size: [2, 2],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const germany = results.find(
      (r) => r.countryCode === 'DE' && r.date === '2024M01'
    );

    expect(germany).toBeDefined();
    expect(germany!.value).toBe(5.8);
    expect(germany!.source).toBe('Eurostat');
    expect(germany!.country).toBe('Germany');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('空データの場合は空配列を返す', async () => {
    const mockResponse = {
      dimension: {
        geo: { category: { index: {}, label: {} } },
        time: { category: { index: {}, label: {} } },
      },
      value: {},
      size: [0, 0],
    };

    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResponse });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
