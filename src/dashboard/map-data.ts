/** 国の表示情報 */
export interface CountryInfo {
  /** 日本語名 */
  nameJa: string;
  /** 英語名 */
  nameEn: string;
  /** 緯度 */
  lat: number;
  /** 経度 */
  lng: number;
  /** 地域カテゴリ */
  region: string;
  /** ISO alpha-2 コード */
  alpha2: string;
}

/** 対象国の情報マップ（alpha-3コードをキーとする） */
export const COUNTRY_INFO: Record<string, CountryInfo> = {
  USA: { nameJa: 'アメリカ', nameEn: 'United States', lat: 37.09, lng: -95.71, region: '北米', alpha2: 'US' },
  JPN: { nameJa: '日本', nameEn: 'Japan', lat: 36.20, lng: 138.25, region: 'アジア', alpha2: 'JP' },
  DEU: { nameJa: 'ドイツ', nameEn: 'Germany', lat: 51.17, lng: 10.45, region: 'ヨーロッパ', alpha2: 'DE' },
  GBR: { nameJa: 'イギリス', nameEn: 'United Kingdom', lat: 55.38, lng: -3.44, region: 'ヨーロッパ', alpha2: 'GB' },
  FRA: { nameJa: 'フランス', nameEn: 'France', lat: 46.23, lng: 2.21, region: 'ヨーロッパ', alpha2: 'FR' },
  CHN: { nameJa: '中国', nameEn: 'China', lat: 35.86, lng: 104.20, region: 'アジア', alpha2: 'CN' },
  IND: { nameJa: 'インド', nameEn: 'India', lat: 20.59, lng: 78.96, region: 'アジア', alpha2: 'IN' },
  BRA: { nameJa: 'ブラジル', nameEn: 'Brazil', lat: -14.24, lng: -51.93, region: '南米', alpha2: 'BR' },
  KOR: { nameJa: '韓国', nameEn: 'South Korea', lat: 35.91, lng: 127.77, region: 'アジア', alpha2: 'KR' },
  AUS: { nameJa: 'オーストラリア', nameEn: 'Australia', lat: -25.27, lng: 133.78, region: 'オセアニア', alpha2: 'AU' },
  CAN: { nameJa: 'カナダ', nameEn: 'Canada', lat: 56.13, lng: -106.35, region: '北米', alpha2: 'CA' },
  ITA: { nameJa: 'イタリア', nameEn: 'Italy', lat: 41.87, lng: 12.57, region: 'ヨーロッパ', alpha2: 'IT' },
  MEX: { nameJa: 'メキシコ', nameEn: 'Mexico', lat: 23.63, lng: -102.55, region: '北米', alpha2: 'MX' },
  IDN: { nameJa: 'インドネシア', nameEn: 'Indonesia', lat: -0.79, lng: 113.92, region: 'アジア', alpha2: 'ID' },
  TUR: { nameJa: 'トルコ', nameEn: 'Turkey', lat: 38.96, lng: 35.24, region: '中東', alpha2: 'TR' },
  EU:  { nameJa: 'EU', nameEn: 'European Union', lat: 50.85, lng: 4.35, region: 'ヨーロッパ', alpha2: 'EU' },
};

/** alpha-2 → alpha-3 の逆引きマップ */
const ALPHA2_TO_ALPHA3: Record<string, string> = {};
for (const [alpha3, info] of Object.entries(COUNTRY_INFO)) {
  ALPHA2_TO_ALPHA3[info.alpha2] = alpha3;
}

/** 国コード（alpha-2 or alpha-3）から国情報を取得する */
export function getCountryInfo(code: string): CountryInfo | undefined {
  if (COUNTRY_INFO[code]) {
    return COUNTRY_INFO[code];
  }
  const alpha3 = ALPHA2_TO_ALPHA3[code];
  if (alpha3) {
    return COUNTRY_INFO[alpha3];
  }
  return undefined;
}

/** 対象国コード一覧（alpha-3）を返す */
export function getTargetCountryCodes(): string[] {
  return Object.keys(COUNTRY_INFO);
}
