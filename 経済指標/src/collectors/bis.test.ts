import { BisCollector } from './bis';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('BisCollector', () => {
  let collector: BisCollector;

  beforeEach(() => {
    collector = new BisCollector();
    mockFetch.mockReset();
  });

  test('nameがBISである', () => {
    expect(collector.name).toBe('BIS');
  });

  test('BIS SDMX JSONレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      dataSets: [
        {
          series: {
            '0': {
              observations: {
                '0': [5.25],
                '1': [5.50],
              },
            },
          },
        },
      ],
      structure: {
        dimensions: {
          series: [
            { values: [{ id: 'US', name: 'United States' }] },
          ],
          observation: [
            { values: [{ id: '2024-01-01' }, { id: '2024-02-01' }] },
          ],
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const usRate = results.find(
      (r) => r.countryCode === 'US' && r.date === '2024-01-01'
    );

    expect(usRate).toBeDefined();
    expect(usRate!.value).toBe(5.25);
    expect(usRate!.source).toBe('BIS');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('空データの場合は空配列を返す', async () => {
    const mockResponse = {
      dataSets: [{ series: {} }],
      structure: {
        dimensions: {
          series: [{ values: [] }],
          observation: [{ values: [] }],
        },
      },
    };

    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResponse });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
