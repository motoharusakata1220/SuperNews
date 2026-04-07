import { Collector, EconomicIndicator } from '../types';
import { BIS_DATASETS } from '../config/indicators';

// BIS SDMX RESTful API
const BASE_URL = 'https://data.bis.org/api/v2/data/dataflow/BIS';

interface BisSeries {
  observations: Record<string, [number]>;
}

interface BisDimValue {
  id: string;
  name?: string;
}

interface BisResponse {
  dataSets: [{ series: Record<string, BisSeries> }];
  structure: {
    dimensions: {
      series: { values: BisDimValue[] }[];
      observation: [{ values: BisDimValue[] }];
    };
  };
}

export class BisCollector implements Collector {
  readonly name = 'BIS';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const dataset of BIS_DATASETS) {
      const data = await this.fetchDataset(dataset);
      results.push(...data);
    }

    return results;
  }

  private async fetchDataset(
    dataset: typeof BIS_DATASETS[number]
  ): Promise<EconomicIndicator[]> {
    const url = `${BASE_URL}/${dataset.datasetCode}/${dataset.key}?format=jsondata&lastNObservations=30`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as BisResponse;
      const seriesData = json.dataSets[0].series;
      const countryDim = json.structure.dimensions.series[0].values;
      const timeDim = json.structure.dimensions.observation[0].values;
      const results: EconomicIndicator[] = [];

      for (const [seriesKey, series] of Object.entries(seriesData)) {
        const countryIdx = parseInt(seriesKey, 10);
        const countryVal = countryDim[countryIdx];
        if (!countryVal) continue;

        for (const [obsIdx, obsVal] of Object.entries(series.observations)) {
          const timeVal = timeDim[parseInt(obsIdx, 10)];
          if (!timeVal) continue;

          results.push({
            country: countryVal.name ?? countryVal.id,
            countryCode: countryVal.id,
            indicator: dataset.name,
            indicatorCode: `${dataset.datasetCode}/${dataset.key}`,
            value: obsVal[0],
            date: timeVal.id,
            source: 'BIS',
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
