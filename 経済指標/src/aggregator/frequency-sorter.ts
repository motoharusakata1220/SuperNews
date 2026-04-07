import { EconomicIndicator, Frequency, FrequencyGrouped } from '../types';

const ALL_FREQUENCIES: Frequency[] = ['日次', '月次', '四半期', '年次'];

export function sortByFrequency(data: EconomicIndicator[]): FrequencyGrouped {
  const grouped: FrequencyGrouped = {
    '日次': [],
    '月次': [],
    '四半期': [],
    '年次': [],
  };

  for (const item of data) {
    grouped[item.frequency].push(item);
  }

  for (const freq of ALL_FREQUENCIES) {
    grouped[freq].sort((a, b) => b.date.localeCompare(a.date));
  }

  return grouped;
}
