import { Collector, EconomicIndicator } from '../types';
import { WHO_INDICATORS, TARGET_COUNTRIES } from '../config/indicators';

// WHO Global Health Observatory (GHO) OData API
const BASE_URL = 'https://ghoapi.azureedge.net/api';

// alpha-3 codes for filtering
const TARGET_SET = new Set(TARGET_COUNTRIES);

interface GhoEntry {
  SpatialDim: string;
  TimeDim: number;
  NumericValue: number | null;
}

interface GhoResponse {
  value: GhoEntry[];
}

export class WhoCollector implements Collector {
  readonly name = 'WHO';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicator of WHO_INDICATORS) {
      const data = await this.fetchIndicator(indicator);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(
    indicator: typeof WHO_INDICATORS[number]
  ): Promise<EconomicIndicator[]> {
    const url = `${BASE_URL}/${indicator.code}?$filter=TimeDimensionBegin ge 2018-01-01`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as GhoResponse;
      if (!json.value || json.value.length === 0) return [];

      return json.value
        .filter((entry) => TARGET_SET.has(entry.SpatialDim) && entry.NumericValue !== null)
        .map((entry) => ({
          country: entry.SpatialDim,
          countryCode: entry.SpatialDim,
          indicator: indicator.name,
          indicatorCode: indicator.code,
          value: entry.NumericValue,
          date: String(entry.TimeDim),
          source: 'WHO' as const,
          frequency: indicator.frequency,
          unit: indicator.unit,
        }));
    } catch {
      return [];
    }
  }
}
