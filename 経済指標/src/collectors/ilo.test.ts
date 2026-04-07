import { IloCollector } from './ilo';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('IloCollector', () => {
  let collector: IloCollector;

  beforeEach(() => {
    collector = new IloCollector();
    mockFetch.mockReset();
  });

  test('nameがILOである', () => {
    expect(collector.name).toBe('ILO');
  });

  test('ILOSTAT APIレスポンスを正規化された形式に変換できる', async () => {
    const mockResponse = {
      data: [
        {
          ref_area: { label: 'Japan' },
          classif1: { label: 'Age: Total' },
          classif2: { label: 'Sex: Total' },
          time_period: '2023',
          obs_value: 3.1,
        },
        {
          ref_area: { label: 'United States' },
          classif1: { label: 'Age: Total' },
          classif2: { label: 'Sex: Total' },
          time_period: '2023',
          obs_value: 3.6,
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const results = await collector.collect();
    const japanUnemp = results.find(
      (r) => r.country === 'Japan'
    );

    expect(japanUnemp).toBeDefined();
    expect(japanUnemp!.value).toBe(3.1);
    expect(japanUnemp!.source).toBe('ILO');
    expect(japanUnemp!.date).toBe('2023');
  });

  test('APIエラー時は空配列を返す', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });

  test('データが空の場合は空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    const results = await collector.collect();
    expect(results).toEqual([]);
  });
});
