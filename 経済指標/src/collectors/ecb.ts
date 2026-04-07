import { Collector, EconomicIndicator } from '../types';
import { ECB_SERIES } from '../config/indicators';

const BASE_URL = 'https://data-api.ecb.europa.eu/service/data';

interface EcbObservations {
  [key: string]: [number];
}

interface EcbSeries {
  observations: EcbObservations;
}

interface EcbTimePeriod {
  id: string;
  name: string;
}

interface EcbResponse {
  dataSets: [{ series: Record<string, EcbSeries> }];
  structure: {
    dimensions: {
      observation: [{ values: EcbTimePeriod[] }];
    };
  };
}

export class EcbCollector implements Collector {
  readonly name = 'ECB';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const seriesDef of ECB_SERIES) {
      const data = await this.fetchSeries(seriesDef);
      results.push(...data);
    }

    return results;
  }

  private async fetchSeries(seriesDef: {
    key: string;
    name: string;
    frequency: EconomicIndicator['frequency'];
    unit: string;
  }): Promise<EconomicIndicator[]> {
    const url = `${BASE_URL}/${seriesDef.key}?format=jsondata&lastNObservations=30`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }

      const json = (await response.json()) as EcbResponse;

      const seriesData = json.dataSets[0].series;
      const timePeriods = json.structure.dimensions.observation[0].values;
      const results: EconomicIndicator[] = [];

      for (const seriesKey of Object.keys(seriesData)) {
        const series = seriesData[seriesKey];
        const observations = series.observations;

        for (const [obsIndex, obsValue] of Object.entries(observations)) {
          const periodIndex = parseInt(obsIndex, 10);
          const period = timePeriods[periodIndex];
          if (!period) continue;

          results.push({
            country: 'EU',
            countryCode: 'EU',
            indicator: seriesDef.name,
            indicatorCode: seriesDef.key,
            value: obsValue[0],
            date: period.id,
            source: 'ECB',
            frequency: seriesDef.frequency,
            unit: seriesDef.unit,
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
