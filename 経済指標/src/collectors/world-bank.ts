import { Collector, EconomicIndicator } from '../types';
import { WORLD_BANK_INDICATORS, TARGET_COUNTRIES, IndicatorDef } from '../config/indicators';

const BASE_URL = 'https://api.worldbank.org/v2';

interface WBDataEntry {
  country: { id: string; value: string };
  indicator: { id: string; value: string };
  date: string;
  value: number | null;
}

export class WorldBankCollector implements Collector {
  readonly name = 'WorldBank';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicatorDef of WORLD_BANK_INDICATORS) {
      const data = await this.fetchIndicator(indicatorDef);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(indicatorDef: IndicatorDef): Promise<EconomicIndicator[]> {
    const countries = TARGET_COUNTRIES.join(';');
    const url = `${BASE_URL}/country/${countries}/indicator/${indicatorDef.code}?format=json&per_page=500&date=2020:2025`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }

      const json = (await response.json()) as [unknown, WBDataEntry[] | null];
      const data = json[1];

      if (!data) {
        return [];
      }

      return data.map((entry) => ({
        country: entry.country.value,
        countryCode: entry.country.id,
        indicator: indicatorDef.name,
        indicatorCode: entry.indicator.id,
        value: entry.value,
        date: entry.date,
        source: 'WorldBank' as const,
        frequency: indicatorDef.frequency,
        unit: indicatorDef.unit,
      }));
    } catch {
      return [];
    }
  }
}
