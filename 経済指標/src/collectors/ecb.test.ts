import { EcbCollector } from './ecb';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EcbCollector', () => {
  let collector: EcbCollector;

  beforeEach(() => {
    collector = new EcbCollector();
    mockFetch.mockReset();
  });

  test('nameがECBである', () => {
    expect(collector.name).toBe('ECB');
  });

  test('SDMX JSONレスポンスを正規化された形式に変換できる', async () => {
    // ECB SDMX JSON形式（簡略版）
    const mockResponse = {
      dataSets: [
        {
          series: {
            '0:0:0:0:0': {
              observations: {
                '0': [1.0856],
                '1': [1.0912],
              },
            },
          },
        },
      ],
      structure: {
        dimensions: {
          observation: [
            {
              values: [
                { id: '2024-03-01', name: '2024-03-01' },
                { id: '2024-03-02', name: '2024-03-02' },
              ],
            },
          ],
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].source).toBe('ECB');
    expect(results[0].value).toBe(1.0856);
    expect(results[0].date).toBe('2024-03-01');
    expect(results[0].country).toBe('EU');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('空データの場合は空配列を返す', async () => {
    const mockResponse = {
      dataSets: [{ series: {} }],
      structure: {
        dimensions: {
          observation: [{ values: [] }],
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
