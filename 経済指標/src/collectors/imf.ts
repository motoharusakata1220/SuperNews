import { Collector, EconomicIndicator, Frequency } from '../types';
import { IMF_DATASETS, TARGET_COUNTRIES } from '../config/indicators';

const BASE_URL = 'http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData';

interface ImfObs {
  '@TIME_PERIOD': string;
  '@OBS_VALUE': string;
}

interface ImfSeries {
  '@REF_AREA': string;
  '@INDICATOR': string;
  Obs: ImfObs | ImfObs[];
}

export class ImfCollector implements Collector {
  readonly name = 'IMF';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const dataset of IMF_DATASETS) {
      for (const indicator of dataset.indicators) {
        const data = await this.fetchIndicator(
          dataset.datasetCode,
          indicator.code,
          indicator.name,
          indicator.frequency
        );
        results.push(...data);
      }
    }

    return results;
  }

  private async fetchIndicator(
    datasetCode: string,
    indicatorCode: string,
    indicatorName: string,
    frequency: Frequency
  ): Promise<EconomicIndicator[]> {
    const countries = TARGET_COUNTRIES.join('+');
    const url = `${BASE_URL}/${datasetCode}/${frequency === '月次' ? 'M' : 'Q'}.${countries}.${indicatorCode}?startPeriod=2020&endPeriod=2025`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }

      const json = await response.json() as {
        CompactData: {
          DataSet: {
            Series?: ImfSeries | ImfSeries[];
          };
        };
      };

      const dataset = json.CompactData.DataSet;
      if (!dataset.Series) {
        return [];
      }

      const seriesArray = Array.isArray(dataset.Series)
        ? dataset.Series
        : [dataset.Series];

      const results: EconomicIndicator[] = [];

      for (const series of seriesArray) {
        const obsArray = Array.isArray(series.Obs)
          ? series.Obs
          : [series.Obs];

        for (const obs of obsArray) {
          results.push({
            country: series['@REF_AREA'],
            countryCode: series['@REF_AREA'],
            indicator: indicatorName,
            indicatorCode: series['@INDICATOR'],
            value: parseFloat(obs['@OBS_VALUE']),
            date: obs['@TIME_PERIOD'],
            source: 'IMF',
            frequency,
            unit: frequency === '月次' ? '指数/レート' : 'USドル',
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}
