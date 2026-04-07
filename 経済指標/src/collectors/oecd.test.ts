import { OecdCollector } from './oecd';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OecdCollector', () => {
  let collector: OecdCollector;

  beforeEach(() => {
    collector = new OecdCollector();
    mockFetch.mockReset();
  });

  test('nameがOECDである', () => {
    expect(collector.name).toBe('OECD');
  });

  test('SDMX JSONレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      dataSets: [
        {
          series: {
            '0:0': {
              observations: {
                '0': [7.4],
                '1': [7.5],
              },
            },
          },
        },
      ],
      structure: {
        dimensions: {
          series: [
            { values: [{ id: 'JPN', name: 'Japan' }] },
            { values: [{ id: 'SW_LIFS' }] },
          ],
          observation: [
            { values: [{ id: '2022' }, { id: '2023' }] },
          ],
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const lifesat = results.find(
      (r) => r.countryCode === 'JPN' && r.indicator === '生活満足度'
    );

    expect(lifesat).toBeDefined();
    expect(lifesat!.value).toBe(7.4);
    expect(lifesat!.source).toBe('OECD');
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
          series: [{ values: [] }, { values: [] }],
          observation: [{ values: [] }],
        },
      },
    };

    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResponse });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
