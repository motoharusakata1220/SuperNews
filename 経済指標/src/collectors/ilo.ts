import { Collector, EconomicIndicator } from '../types';
import { ILO_INDICATORS, TARGET_COUNTRIES } from '../config/indicators';

const BASE_URL = 'https://www.ilo.org/ilostat/faces/ilostat-api/data';
const SDMX_URL = 'https://sdmx.ilo.org/rest/data/ILO,DF_UNE_DEAP_SEX_AGE_RT';

// ILOSTAT SDMX REST API
const API_URL = 'https://sdmx.ilo.org/rest/data/ILO';

interface IloDataEntry {
  ref_area: { label: string };
  classif1?: { label: string };
  classif2?: { label: string };
  time_period: string;
  obs_value: number;
}

interface IloResponse {
  data: IloDataEntry[];
}

// ISO alpha-3 to alpha-2 for country matching
const COUNTRY_MAP: Record<string, string> = {
  USA: 'US', JPN: 'JP', DEU: 'DE', GBR: 'GB', FRA: 'FR',
  CHN: 'CN', IND: 'IN', BRA: 'BR', KOR: 'KR', AUS: 'AU',
  CAN: 'CA', ITA: 'IT', MEX: 'MX', IDN: 'ID', TUR: 'TR',
};

export class IloCollector implements Collector {
  readonly name = 'ILO';

  async collect(): Promise<EconomicIndicator[]> {
    const results: EconomicIndicator[] = [];

    for (const indicator of ILO_INDICATORS) {
      const data = await this.fetchIndicator(indicator);
      results.push(...data);
    }

    return results;
  }

  private async fetchIndicator(
    indicator: typeof ILO_INDICATORS[number]
  ): Promise<EconomicIndicator[]> {
    const countries = TARGET_COUNTRIES.map((c) => COUNTRY_MAP[c] ?? c).join('+');
    const url = `${API_URL},DF_${indicator.code}/.${countries}..?format=jsondata&lastNObservations=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = (await response.json()) as IloResponse;
      if (!json.data || json.data.length === 0) return [];

      return json.data.map((entry) => ({
        country: entry.ref_area.label,
        countryCode: entry.ref_area.label,
        indicator: indicator.name,
        indicatorCode: indicator.code,
        value: entry.obs_value,
        date: entry.time_period,
        source: 'ILO' as const,
        frequency: indicator.frequency,
        unit: indicator.unit,
      }));
    } catch {
      return [];
    }
  }
}
