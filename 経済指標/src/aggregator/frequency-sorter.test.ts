import { sortByFrequency } from './frequency-sorter';
import { EconomicIndicator, FrequencyGrouped } from '../types';

const makeIndicator = (overrides: Partial<EconomicIndicator>): EconomicIndicator => ({
  country: 'Japan',
  countryCode: 'JP',
  indicator: 'テスト指標',
  indicatorCode: 'TEST',
  value: 100,
  date: '2024',
  source: 'WorldBank',
  frequency: '年次',
  unit: '%',
  ...overrides,
});

describe('sortByFrequency', () => {
  test('更新頻度別にグループ化できる', () => {
    const data: EconomicIndicator[] = [
      makeIndicator({ frequency: '日次', indicator: '為替' }),
      makeIndicator({ frequency: '月次', indicator: 'CPI' }),
      makeIndicator({ frequency: '四半期', indicator: 'GDP速報' }),
      makeIndicator({ frequency: '年次', indicator: 'GDP' }),
      makeIndicator({ frequency: '年次', indicator: '人口' }),
    ];

    const result: FrequencyGrouped = sortByFrequency(data);

    expect(result['日次']).toHaveLength(1);
    expect(result['月次']).toHaveLength(1);
    expect(result['四半期']).toHaveLength(1);
    expect(result['年次']).toHaveLength(2);
  });

  test('空配列を渡すと各頻度が空配列になる', () => {
    const result = sortByFrequency([]);

    expect(result['日次']).toEqual([]);
    expect(result['月次']).toEqual([]);
    expect(result['四半期']).toEqual([]);
    expect(result['年次']).toEqual([]);
  });

  test('各グループ内のデータが日付降順でソートされる', () => {
    const data: EconomicIndicator[] = [
      makeIndicator({ date: '2022', frequency: '年次' }),
      makeIndicator({ date: '2024', frequency: '年次' }),
      makeIndicator({ date: '2023', frequency: '年次' }),
    ];

    const result = sortByFrequency(data);

    expect(result['年次'][0].date).toBe('2024');
    expect(result['年次'][1].date).toBe('2023');
    expect(result['年次'][2].date).toBe('2022');
  });
});
