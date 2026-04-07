import { Collector, EconomicIndicator } from '../types';
import { EUROSTAT_DATASETS, EUROSTAT_COUNTRIES } from '../config/indicators';

// Eurostat JSON Statistics API
const BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

interface EurostatDimCategory {
  index: Record<string, number>;
  label: Record<string, string>;
}

interface EurostatResponse {
  dimension: {
    geo: { category: EurostatDimCategory };
    time: { category: EurostatDimCategory };
  };
  value: Record<string, number>;
  size: number[];
}

export class EurostatCollector implements Collector {
  readonly name = 'Eurostat';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const dataset of EUROSTAT_DATASETS) {
      const data = await this.fetchDataset(dataset);
      results.push(...data);
    }

    return results;
  }

  private async fetchDataset(
    dataset: typeof EUROSTAT_DATASETS[number]
  ): Promise<EconomicIndicator[]> {
    const geoFilter = EUROSTAT_COUNTRIES.map((c) => `geo=${c}`).join('&');
    const url = `${BASE_URL}/${dataset.datasetCode}?${geoFilter}&format=JSON&lang=en`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as EurostatResponse;
      const geoIndex = json.dimension.geo.category.index;
      const geoLabel = json.dimension.geo.category.label;
      const timeIndex = json.dimension.time.category.index;
      const results: EconomicIndicator[] = [];

      const geoEntries = Object.entries(geoIndex);
      const timeEntries = Object.entries(timeIndex);
      const timeCount = timeEntries.length;

      for (const [geoCode, geoIdx] of geoEntries) {
        for (const [timePeriod, timeIdx] of timeEntries) {
          const valueKey = String(geoIdx * timeCount + timeIdx);
          const value = json.value[valueKey];
          if (value === undefined) continue;

          results.push({
            country: geoLabel[geoCode] ?? geoCode,
            countryCode: geoCode,
            indicator: dataset.name,
            indicatorCode: dataset.datasetCode,
            value,
            date: timePeriod,
            source: 'Eurostat',
            frequency: dataset.frequency,
            unit: dataset.unit,
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
