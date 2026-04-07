import { WtoCollector } from './wto';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WtoCollector', () => {
  let collector: WtoCollector;

  beforeEach(() => {
    collector = new WtoCollector();
    mockFetch.mockReset();
  });

  test('nameがWTOである', () => {
    expect(collector.name).toBe('WTO');
  });

  test('WTO Timeseries APIレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      Dataset: [
        {
          ReportingEconomy: { Code: '392', Name: 'Japan' },
          Year: '2023',
          Value: 756032,
        },
        {
          ReportingEconomy: { Code: '840', Name: 'United States' },
          Year: '2023',
          Value: 2019000,
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const japan = results.find((r) => r.country === 'Japan');

    expect(japan).toBeDefined();
    expect(japan!.value).toBe(756032);
    expect(japan!.source).toBe('WTO');
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
      json: async () => ({ Dataset: [] }),
    });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
