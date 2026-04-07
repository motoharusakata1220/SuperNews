import { Collector, EconomicIndicator } from '../types';
import { FAO_INDICATORS, FAO_COUNTRIES } from '../config/indicators';

// FAOSTAT API
const BASE_URL = 'https://fenixservices.fao.org/faostat/api/v1/en/data';

const TARGET_FAO_CODES = new Set(Object.keys(FAO_COUNTRIES));

interface FaoEntry {
  Area: string;
  'Area Code (M49)': string;
  Year: number;
  Value: number | null;
  Unit: string;
}

interface FaoResponse {
  data: FaoEntry[];
}

export class FaoCollector implements Collector {
  readonly name = 'FAO';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicator of FAO_INDICATORS) {
      const data = await this.fetchIndicator(indicator);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(
    indicator: typeof FAO_INDICATORS[number]
  ): Promise<EconomicIndicator[]> {
    const areas = Object.keys(FAO_COUNTRIES).join(',');
    const url = `${BASE_URL}/${indicator.domainCode}?area=${areas}&element=${indicator.elementCode}&item=${indicator.itemCode}&year=2018,2019,2020,2021,2022,2023&output_type=objects`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as FaoResponse;
      if (!json.data || json.data.length === 0) return [];

      return json.data
        .filter((entry) => entry.Value !== null)
        .map((entry) => ({
          country: entry.Area,
          countryCode: entry['Area Code (M49)'].replace(/'/g, ''),
          indicator: indicator.name,
          indicatorCode: `${indicator.domainCode}/${indicator.elementCode}/${indicator.itemCode}`,
          value: entry.Value,
          date: String(entry.Year),
          source: 'FAO' as const,
          frequency: indicator.frequency,
          unit: indicator.unit,
        }));
    } catch {
      return [];
    }
  }
}
