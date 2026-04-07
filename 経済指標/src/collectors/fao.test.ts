import { FaoCollector } from './fao';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FaoCollector', () => {
  let collector: FaoCollector;

  beforeEach(() => {
    collector = new FaoCollector();
    mockFetch.mockReset();
  });

  test('nameがFAOである', () => {
    expect(collector.name).toBe('FAO');
  });

  test('FAOSTAT APIレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      data: [
        {
          Area: 'Japan',
          'Area Code (M49)': "'392'",
          Year: 2022,
          Value: 2.5,
          Unit: '%',
        },
        {
          Area: 'United States of America',
          'Area Code (M49)': "'840'",
          Year: 2022,
          Value: 3.1,
          Unit: '%',
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
    expect(japan!.value).toBe(2.5);
    expect(japan!.source).toBe('FAO');
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
      json: async () => ({ data: [] }),
    });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
