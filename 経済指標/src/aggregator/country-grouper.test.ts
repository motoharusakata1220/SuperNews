import { groupByCountry } from './country-grouper';
import { EconomicIndicator } from '../types';

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

describe('groupByCountry', () => {
  test('国コード別にグループ化できる', () => {
    const data: EconomicIndicator[] = [
      makeIndicator({ countryCode: 'JP', country: 'Japan' }),
      makeIndicator({ countryCode: 'US', country: 'United States' }),
      makeIndicator({ countryCode: 'JP', country: 'Japan', indicator: 'GDP' }),
    ];

    const result = groupByCountry(data);

    expect(Object.keys(result)).toEqual(['JP', 'US']);
    expect(result['JP']).toHaveLength(2);
    expect(result['US']).toHaveLength(1);
  });

  test('空配列を渡すと空オブジェクトを返す', () => {
    const result = groupByCountry([]);
    expect(result).toEqual({});
  });
});
