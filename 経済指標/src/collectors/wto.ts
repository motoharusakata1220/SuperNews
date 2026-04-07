import { Collector, EconomicIndicator } from '../types';
import { WTO_INDICATORS, WTO_COUNTRIES } from '../config/indicators';

// WTO Timeseries API
const BASE_URL = 'https://api.wto.org/timeseries/v1/data';

const TARGET_WTO_CODES = new Set(Object.keys(WTO_COUNTRIES));

interface WtoEntry {
  ReportingEconomy: { Code: string; Name: string };
  Year: string;
  Value: number;
}

interface WtoResponse {
  Dataset: WtoEntry[];
}

export class WtoCollector implements Collector {
  readonly name = 'WTO';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicator of WTO_INDICATORS) {
      const data = await this.fetchIndicator(indicator);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(
    indicator: typeof WTO_INDICATORS[number]
  ): Promise<EconomicIndicator[]> {
    const reporters = Object.keys(WTO_COUNTRIES).join(',');
    const url = `${BASE_URL}?i=${indicator.indicatorCode}&r=${reporters}&ps=2018-2025&fmt=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as WtoResponse;
      if (!json.Dataset || json.Dataset.length === 0) return [];

      return json.Dataset
        .filter((entry) => TARGET_WTO_CODES.has(entry.ReportingEconomy.Code))
        .map((entry) => ({
          country: entry.ReportingEconomy.Name,
          countryCode: entry.ReportingEconomy.Code,
          indicator: indicator.name,
          indicatorCode: indicator.indicatorCode,
          value: entry.Value,
          date: entry.Year,
          source: 'WTO' as const,
          frequency: indicator.frequency,
          unit: indicator.unit,
        }));
    } catch {
      return [];
    }
  }
}
