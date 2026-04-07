import { ImfCollector } from './imf';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ImfCollector', () => {
  let collector: ImfCollector;

  beforeEach(() => {
    collector = new ImfCollector();
    mockFetch.mockReset();
  });

  test('nameがIMFである', () => {
    expect(collector.name).toBe('IMF');
  });

  test('IFS APIレスポンスを正規化された形式に変換できる', async () => {
    // IMF JSON RESTful API形式
    const mockResponse = {
      CompactData: {
        DataSet: {
          Series: [
            {
              '@REF_AREA': 'JP',
              '@INDICATOR': 'ENDA_XDC_USD_RATE',
              Obs: [
                { '@TIME_PERIOD': '2024-01', '@OBS_VALUE': '148.25' },
                { '@TIME_PERIOD': '2024-02', '@OBS_VALUE': '150.10' },
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

    const jpyRate = results.find(
      (r: { countryCode: string; date: string }) => r.countryCode === 'JP' && r.date === '2024-01'
    );

    expect(jpyRate).toBeDefined();
    expect(jpyRate!.indicator).toBe('為替レート（対USドル）');
    expect(jpyRate!.value).toBe(148.25);
    expect(jpyRate!.source).toBe('IMF');
    expect(jpyRate!.frequency).toBe('月次');
  });

  test('Seriesが単一オブジェクトの場合も処理できる', async () => {
    const mockResponse = {
      CompactData: {
        DataSet: {
          Series: {
            '@REF_AREA': 'US',
            '@INDICATOR': 'ENDA_XDC_USD_RATE',
            Obs: { '@TIME_PERIOD': '2024-01', '@OBS_VALUE': '1.00' },
          },
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].value).toBe(1.0);
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('データが空の場合は空配列を返す', async () => {
    const mockResponse = {
      CompactData: {
        DataSet: {},
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
