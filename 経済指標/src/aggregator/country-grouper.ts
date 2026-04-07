import { EconomicIndicator, CountryGrouped } from '../types';

export function groupByCountry(data: EconomicIndicator[]): CountryGrouped {
  const grouped: CountryGrouped = {};

  for (const item of data) {
    if (!grouped[item.countryCode]) {
      grouped[item.countryCode] = [];
    }
    grouped[item.countryCode].push(item);
  }

  return grouped;
}
