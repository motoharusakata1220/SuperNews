/** 更新頻度 */
export type Frequency = '日次' | '月次' | '四半期' | '年次';

/** 正規化された経済指標データ */
export interface EconomicIndicator {
  /** 国名（英語） */
  country: string;
  /** 国コード（ISO 3166-1 alpha-2 or alpha-3） */
  countryCode: string;
  /** 指標名（日本語） */
  indicator: string;
  /** 指標コード（データソース固有） */
  indicatorCode: string;
  /** 値 */
  value: number | null;
  /** データ日付（YYYY or YYYY-MM or YYYY-MM-DD） */
  date: string;
  /** データソース */
  source: 'WorldBank' | 'IMF' | 'ECB' | 'OECD' | 'ILO' | 'WHO' | 'UNData' | 'Eurostat' | 'BIS' | 'WTO' | 'FAO';
  /** 更新頻度 */
  frequency: Frequency;
  /** 単位 */
  unit: string;
}

/** コレクターのインターフェース */
export interface Collector {
  /** データソース名 */
  readonly name: string;
  /** データを取得して正規化する */
  collect(): Promise<EconomicIndicator[]>;
}

/** 更新頻度別に分類されたデータ */
export type FrequencyGrouped = Record<Frequency, EconomicIndicator[]>;

/** 国別にグループ化されたデータ */
export type CountryGrouped = Record<string, EconomicIndicator[]>;

/** 国の基本情報（REST Countries APIから取得） */
export interface CountryBasicInfo {
  /** 正式名称（英語） */
  name: string;
  /** 正式名称（現地語） */
  nativeName: string;
  /** 国コード（ISO alpha-3） */
  countryCode: string;
  /** 首都 */
  capital: string;
  /** 地域 */
  region: string;
  /** サブ地域 */
  subregion: string;
  /** 面積（km2） */
  area: number;
  /** 人口 */
  population: number;
  /** 公用語 */
  languages: string[];
  /** 通貨 */
  currencies: string[];
  /** 国旗絵文字 */
  flag: string;
  /** 国旗画像URL */
  flagUrl: string;
  /** 隣接国コード */
  borders: string[];
  /** タイムゾーン */
  timezones: string[];
  /** 国際電話コード */
  callingCode: string;
  /** 独立国かどうか */
  independent: boolean;
  /** 国連加盟国かどうか */
  unMember: boolean;
}

/** ガバナンス指標（World Bank WGI） */
export interface GovernanceIndicators {
  /** 国民の声と説明責任 */
  voiceAndAccountability: number | null;
  /** 政治安定性・暴力の不在 */
  politicalStability: number | null;
  /** 政府有効性 */
  governmentEffectiveness: number | null;
  /** 規制の質 */
  regulatoryQuality: number | null;
  /** 法の支配 */
  ruleOfLaw: number | null;
  /** 腐敗統制 */
  controlOfCorruption: number | null;
}

/** 政治体制情報（マスタデータ） */
export interface PoliticalSystem {
  /** 政治体制の名称 */
  system: string;
  /** 分類（民主主義/権威主義/混合型等） */
  category: string;
  /** 国家元首の種類 */
  headOfState: string;
  /** 政府の長の種類 */
  headOfGovernment: string;
  /** 議会制度 */
  legislature: string;
}

/** 国別プロフィール（全情報を統合） */
export interface CountryProfile {
  /** 基本情報 */
  basicInfo: CountryBasicInfo;
  /** 政治体制 */
  politicalSystem: PoliticalSystem;
  /** ガバナンス指標 */
  governance: GovernanceIndicators;
  /** 経済指標サマリー（最新値のみ） */
  economicSummary: Record<string, { value: number | null; date: string; source: string }>;
}
