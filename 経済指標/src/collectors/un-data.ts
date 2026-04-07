import { Collector, EconomicIndicator } from '../types';
import { UN_INDICATORS } from '../config/indicators';

// UN SDG Global Database API
const BASE_URL = 'https://unstats.un.org/sdgs/UNSDGAPIV5/v1/sdg/Series';

// Target country M49 codes
const TARGET_M49 = new Set([
  '840', '392', '276', '826', '250',  // USA, JPN, DEU, GBR, FRA
  '156', '356', '076', '410', '036',  // CHN, IND, BRA, KOR, AUS
  '124', '380', '484', '360', '792',  // CAN, ITA, MEX, IDN, TUR
]);

interface UnSdgEntry {
  geoAreaCode: string;
  geoAreaName: string;
  timePeriodStart: number;
  value: string;
}

export class UnDataCollector implements Collector {
  readonly name = 'UNData';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicator of UN_INDICATORS) {
      const data = await this.fetchIndicator(indicator);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(
    indicator: typeof UN_INDICATORS[number]
  ): Promise<EconomicIndicator[]> {
    const url = `${BASE_URL}/${indicator.seriesCode}/GeoAreas?timePeriod=2018`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as UnSdgEntry[];
      if (!json || json.length === 0) return [];

      return json
        .filter((entry) => TARGET_M49.has(entry.geoAreaCode))
        .map((entry) => ({
          country: entry.geoAreaName,
          countryCode: entry.geoAreaCode,
          indicator: indicator.name,
          indicatorCode: indicator.seriesCode,
          value: parseFloat(entry.value),
          date: String(entry.timePeriodStart),
          source: 'UNData' as const,
          frequency: indicator.frequency,
          unit: indicator.unit,
        }));
    } catch {
      return [];
    }
  }
}
