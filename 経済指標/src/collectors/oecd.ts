import { Collector, EconomicIndicator } from '../types';
import { OECD_DATASETS, OECD_COUNTRIES } from '../config/indicators';

const BASE_URL = 'https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS';

interface OecdSeriesData {
  observations: Record<string, [number]>;
}

interface OecdDimensionValue {
  id: string;
  name?: string;
}

interface OecdResponse {
  dataSets: [{ series: Record<string, OecdSeriesData> }];
  structure: {
    dimensions: {
      series: { values: OecdDimensionValue[] }[];
      observation: [{ values: OecdDimensionValue[] }];
    };
  };
}

export class OecdCollector implements Collector {
  readonly name = 'OECD';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const dataset of OECD_DATASETS) {
      const data = await this.fetchDataset(dataset);
      results.push(...data);
    }

    return results;
  }

  private async fetchDataset(dataset: typeof OECD_DATASETS[number]): Promise<EconomicIndicator[]> {
    const countries = OECD_COUNTRIES.join('+');
    const url = `${BASE_URL}/${dataset.datasetId}/${countries}.${dataset.indicator}?format=jsondata&lastNObservations=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as OecdResponse;
      const seriesData = json.dataSets[0].series;
      const countryDim = json.structure.dimensions.series[0].values;
      const timeDim = json.structure.dimensions.observation[0].values;
      const results: EconomicIndicator[] = [];

      for (const [seriesKey, series] of Object.entries(seriesData)) {
        const countryIdx = parseInt(seriesKey.split(':')[0], 10);
        const countryVal = countryDim[countryIdx];
        if (!countryVal) continue;

        for (const [obsIdx, obsVal] of Object.entries(series.observations)) {
          const timeVal = timeDim[parseInt(obsIdx, 10)];
          if (!timeVal) continue;

          results.push({
            country: countryVal.name ?? countryVal.id,
            countryCode: countryVal.id,
            indicator: dataset.name,
            indicatorCode: dataset.indicator,
            value: obsVal[0],
            date: timeVal.id,
            source: 'OECD',
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
