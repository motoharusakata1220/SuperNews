import { Frequency } from '../types';

/** World Bank 指標定義 */
export interface IndicatorDef {
  code: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

/** World Bank で取得する指標一覧 */
export const WORLD_BANK_INDICATORS: IndicatorDef[] = [
  // === マクロ経済 ===
  { code: 'NY.GDP.MKTP.CD', name: 'GDP（名目、USドル）', frequency: '年次', unit: 'USドル' },
  { code: 'NY.GDP.MKTP.KD.ZG', name: 'GDP成長率', frequency: '年次', unit: '%' },
  { code: 'NY.GDP.PCAP.CD', name: '一人当たりGDP', frequency: '年次', unit: 'USドル' },
  { code: 'FP.CPI.TOTL.ZG', name: 'インフレ率（CPI）', frequency: '年次', unit: '%' },
  { code: 'BN.CAB.XOKA.CD', name: '経常収支', frequency: '年次', unit: 'USドル' },
  { code: 'GC.DOD.TOTL.GD.ZS', name: '政府債務対GDP比', frequency: '年次', unit: '%' },
  { code: 'GC.REV.XGRT.GD.ZS', name: '政府歳入対GDP比', frequency: '年次', unit: '%' },
  { code: 'NE.EXP.GNFS.ZS', name: '輸出対GDP比', frequency: '年次', unit: '%' },
  { code: 'NE.IMP.GNFS.ZS', name: '輸入対GDP比', frequency: '年次', unit: '%' },

  // === 雇用・労働 ===
  { code: 'SL.UEM.TOTL.ZS', name: '失業率', frequency: '年次', unit: '%' },
  { code: 'SL.UEM.1524.ZS', name: '若年失業率（15-24歳）', frequency: '年次', unit: '%' },
  { code: 'SL.TLF.CACT.ZS', name: '労働力参加率', frequency: '年次', unit: '%' },
  { code: 'SL.TLF.CACT.FE.ZS', name: '女性労働力参加率', frequency: '年次', unit: '%' },
  { code: 'SL.EMP.TOTL.SP.ZS', name: '就業率（対人口比）', frequency: '年次', unit: '%' },
  { code: 'SL.EMP.VULN.ZS', name: '脆弱雇用率', frequency: '年次', unit: '%' },
  { code: 'SL.EMP.SELF.ZS', name: '自営業率', frequency: '年次', unit: '%' },

  // === 人口・社会 ===
  { code: 'SP.POP.TOTL', name: '総人口', frequency: '年次', unit: '人' },
  { code: 'SP.POP.GROW', name: '人口増加率', frequency: '年次', unit: '%' },
  { code: 'SP.DYN.LE00.IN', name: '平均寿命', frequency: '年次', unit: '歳' },
  { code: 'SP.DYN.TFRT.IN', name: '合計特殊出生率', frequency: '年次', unit: '人' },
  { code: 'SP.URB.TOTL.IN.ZS', name: '都市人口割合', frequency: '年次', unit: '%' },

  // === 幸福度・生活の質 ===
  { code: 'NY.ADJ.NNTY.PC.CD', name: '調整済み国民純所得（一人当たり）', frequency: '年次', unit: 'USドル' },
  { code: 'SI.POV.GINI', name: 'ジニ係数（所得格差）', frequency: '年次', unit: '指数' },
  { code: 'SI.POV.DDAY', name: '貧困率（1.90ドル/日基準）', frequency: '年次', unit: '%' },
  { code: 'SE.ADT.LITR.ZS', name: '識字率（成人）', frequency: '年次', unit: '%' },
  { code: 'SH.XPD.CHEX.GD.ZS', name: '医療費対GDP比', frequency: '年次', unit: '%' },
  { code: 'SE.XPD.TOTL.GD.ZS', name: '教育費対GDP比', frequency: '年次', unit: '%' },

  // === エネルギー・環境 ===
  { code: 'EG.USE.PCAP.KG.OE', name: '一人当たりエネルギー消費量', frequency: '年次', unit: 'kg石油換算' },
  { code: 'EN.ATM.CO2E.PC', name: '一人当たりCO2排出量', frequency: '年次', unit: 'トン' },
  { code: 'EG.FEC.RNEW.ZS', name: '再生可能エネルギー割合', frequency: '年次', unit: '%' },

  // === 貿易・投資 ===
  { code: 'BX.KLT.DINV.CD.WD', name: '対内直接投資（FDI）', frequency: '年次', unit: 'USドル' },
  { code: 'TG.VAL.TOTL.GD.ZS', name: '貿易額対GDP比', frequency: '年次', unit: '%' },
  { code: 'BX.TRF.PWKR.CD.DT', name: '海外送金受取額', frequency: '年次', unit: 'USドル' },

  // === 金融 ===
  { code: 'FR.INR.RINR', name: '実質金利', frequency: '年次', unit: '%' },
  { code: 'FM.LBL.BMNY.GD.ZS', name: 'マネーサプライ（M2）対GDP比', frequency: '年次', unit: '%' },
  { code: 'FS.AST.DOMS.GD.ZS', name: '民間信用対GDP比', frequency: '年次', unit: '%' },
];

/** IMF で取得するデータセット */
export const IMF_DATASETS = [
  {
    datasetCode: 'IFS',
    indicators: [
      { code: 'ENDA_XDC_USD_RATE', name: '為替レート（対USドル）', frequency: '月次' as Frequency, unit: '現地通貨/USドル' },
      { code: 'PCPI_IX', name: '消費者物価指数', frequency: '月次' as Frequency, unit: '指数' },
    ],
  },
  {
    datasetCode: 'BOP',
    indicators: [
      { code: 'BCA_BP6_USD', name: '経常収支（BOP）', frequency: '四半期' as Frequency, unit: 'USドル' },
    ],
  },
];

/** ECB で取得する系列 */
export const ECB_SERIES = [
  { key: 'EXR.D.USD.EUR.SP00.A', name: 'EUR/USD為替レート', frequency: '日次' as Frequency, unit: 'USD/EUR' },
  { key: 'EXR.D.JPY.EUR.SP00.A', name: 'EUR/JPY為替レート', frequency: '日次' as Frequency, unit: 'JPY/EUR' },
  { key: 'EXR.D.GBP.EUR.SP00.A', name: 'EUR/GBP為替レート', frequency: '日次' as Frequency, unit: 'GBP/EUR' },
  { key: 'FM.M.U2.EUR.4F.MM.EURIBOR3MD_.HSTA', name: 'EURIBOR 3ヶ月', frequency: '月次' as Frequency, unit: '%' },
];

/** 主要国コード一覧（World Bank / IMF 用、ISO alpha-3） */
export const TARGET_COUNTRIES = [
  'USA', 'JPN', 'DEU', 'GBR', 'FRA',
  'CHN', 'IND', 'BRA', 'KOR', 'AUS',
  'CAN', 'ITA', 'MEX', 'IDN', 'TUR',
];

/** OECD 主要国コード（ISO alpha-3、OECD加盟国のみ） */
export const OECD_COUNTRIES = [
  'USA', 'JPN', 'DEU', 'GBR', 'FRA',
  'KOR', 'AUS', 'CAN', 'ITA', 'MEX', 'TUR',
];

/** OECD で取得するデータセット（SDMX REST API） */
export const OECD_DATASETS = [
  // Better Life Index（幸福度）
  { datasetId: 'BLI', indicator: 'SW_LIFS', name: '生活満足度', frequency: '年次' as Frequency, unit: '指数(0-10)' },
  { datasetId: 'BLI', indicator: 'JE_EMPL', name: '雇用率（OECD）', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'SC_SNTWS', name: '社会的つながり', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'HS_LEB', name: '平均寿命（OECD）', frequency: '年次' as Frequency, unit: '歳' },
  { datasetId: 'BLI', indicator: 'ES_EDUA', name: '高等教育修了率', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'EQ_WATER', name: '水質満足度', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'PS_FSAF', name: '夜間安全感', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'CG_VOTR', name: '投票率', frequency: '年次' as Frequency, unit: '%' },
  { datasetId: 'BLI', indicator: 'WL_EWNH', name: '長時間労働率', frequency: '年次' as Frequency, unit: '%' },
  // 主要経済指標
  { datasetId: 'MEI', indicator: 'LRHUTTTT', name: '調和失業率（OECD）', frequency: '月次' as Frequency, unit: '%' },
  { datasetId: 'MEI', indicator: 'CPALTT01', name: '消費者物価指数（OECD）', frequency: '月次' as Frequency, unit: '指数' },
  { datasetId: 'MEI', indicator: 'LORSGPRT', name: '長期金利', frequency: '月次' as Frequency, unit: '%' },
  { datasetId: 'MEI', indicator: 'IRLTLT01', name: '長期国債利回り', frequency: '月次' as Frequency, unit: '%' },
  // 生産性
  { datasetId: 'PDB_LV', indicator: 'T_GDPPOP', name: '一人当たりGDP（OECD）', frequency: '年次' as Frequency, unit: 'USドル(PPP)' },
  { datasetId: 'PDB_LV', indicator: 'T_GDPHRS', name: '時間当たり労働生産性', frequency: '年次' as Frequency, unit: 'USドル(PPP)' },
  // 税収
  { datasetId: 'REV', indicator: 'TOTALTAX', name: '税収対GDP比（OECD）', frequency: '年次' as Frequency, unit: '%' },
];

/** ILO (ILOSTAT) で取得する指標 — Bulk SDMX API */
export interface IloIndicatorDef {
  code: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const ILO_INDICATORS: IloIndicatorDef[] = [
  // 雇用
  { code: 'EMP_DWAP_SEX_AGE_RT', name: '就業人口比率（ILO）', frequency: '年次', unit: '%' },
  { code: 'UNE_DEAP_SEX_AGE_RT', name: '失業率（ILO）', frequency: '年次', unit: '%' },
  { code: 'UNE_DYAP_SEX_AGE_RT', name: '若年失業率（ILO）', frequency: '年次', unit: '%' },
  { code: 'EAR_4MTH_SEX_ECO_CUR_NB', name: '平均月収', frequency: '年次', unit: '現地通貨' },
  { code: 'HOW_TEMP_SEX_ECO_NB', name: '週平均労働時間', frequency: '年次', unit: '時間' },
  { code: 'LAP_2GDP_NOC_RT', name: '労働生産性（GDP比）', frequency: '年次', unit: 'USドル' },
  // 労働力
  { code: 'EAP_DWAP_SEX_AGE_RT', name: '労働力参加率（ILO）', frequency: '年次', unit: '%' },
  { code: 'EMP_NIFL_SEX_ECO_RT', name: 'インフォーマル雇用率', frequency: '年次', unit: '%' },
  // NEET
  { code: 'EIP_NEET_SEX_RT', name: 'NEET率（若年無業者率）', frequency: '年次', unit: '%' },
  // 賃金
  { code: 'EAR_MGWN_SEX_CUR_NB', name: '最低賃金', frequency: '年次', unit: '現地通貨' },
];

/** WHO (GHO) で取得する指標 — OData API */
export interface WhoIndicatorDef {
  code: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const WHO_INDICATORS: WhoIndicatorDef[] = [
  // 健康寿命・死亡
  { code: 'WHOSIS_000001', name: '健康寿命（HALE）', frequency: '年次', unit: '歳' },
  { code: 'WHOSIS_000002', name: '出生時平均寿命（WHO）', frequency: '年次', unit: '歳' },
  { code: 'NCDMORT2575', name: '非感染症死亡率（30-70歳）', frequency: '年次', unit: '%' },
  { code: 'CHILDMORT5', name: '5歳未満児死亡率', frequency: '年次', unit: '千人当たり' },
  // 医療体制
  { code: 'HWF_0001', name: '医師数（人口1万人当たり）', frequency: '年次', unit: '人/万人' },
  { code: 'HWF_0006', name: '看護師数（人口1万人当たり）', frequency: '年次', unit: '人/万人' },
  { code: 'UHC_INDEX_REPORTED', name: 'ユニバーサル・ヘルスカバレッジ指数', frequency: '年次', unit: '指数' },
  // 生活習慣
  { code: 'SA_0000001688', name: '成人肥満率', frequency: '年次', unit: '%' },
  { code: 'M_Est_smk_curr_std', name: '喫煙率', frequency: '年次', unit: '%' },
  { code: 'SA_0000001462', name: 'アルコール消費量（一人当たり）', frequency: '年次', unit: 'リットル(純アルコール)' },
  // メンタルヘルス
  { code: 'MH_12', name: '自殺率（10万人当たり）', frequency: '年次', unit: '人/10万人' },
  // 環境衛生
  { code: 'WSH_SANITATION_SAFELY_MANAGED', name: '安全な衛生施設利用率', frequency: '年次', unit: '%' },
  { code: 'WSH_WATER_SAFELY_MANAGED', name: '安全な飲料水利用率', frequency: '年次', unit: '%' },
];

/** UN Data で取得する指標 — UNSD API */
export interface UnIndicatorDef {
  seriesCode: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const UN_INDICATORS: UnIndicatorDef[] = [
  // 人間開発指数（HDI）
  { seriesCode: '137506', name: '人間開発指数（HDI）', frequency: '年次', unit: '指数(0-1)' },
  // 犯罪・安全
  { seriesCode: 'VC_IHR_PSRC', name: '意図的殺人率（10万人当たり）', frequency: '年次', unit: '人/10万人' },
  // ジェンダー
  { seriesCode: 'SG_GEN_PARL', name: '女性国会議員比率', frequency: '年次', unit: '%' },
  // SDGs関連
  { seriesCode: 'SI_POV_DAY1', name: '極度の貧困率（SDG 1.1.1）', frequency: '年次', unit: '%' },
  { seriesCode: 'SH_STA_MMRT', name: '妊産婦死亡率（SDG 3.1.1）', frequency: '年次', unit: '10万人当たり' },
  { seriesCode: 'SE_GPI_ICTS', name: 'ICTスキルジェンダー格差（SDG 4）', frequency: '年次', unit: '指数' },
  { seriesCode: 'EN_ATM_GHGT', name: '温室効果ガス排出量（SDG 13）', frequency: '年次', unit: 'MtCO2e' },
  { seriesCode: 'AG_FPA_CFPI', name: '食料価格指数（SDG 2）', frequency: '月次', unit: '指数' },
];

/** Eurostat で取得するデータセット — JSON API */
export interface EurostatDatasetDef {
  datasetCode: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const EUROSTAT_DATASETS: EurostatDatasetDef[] = [
  { datasetCode: 'une_rt_m', name: 'EU失業率', frequency: '月次', unit: '%' },
  { datasetCode: 'prc_hicp_manr', name: 'EU消費者物価上昇率（HICP）', frequency: '月次', unit: '%' },
  { datasetCode: 'ei_isin_m', name: 'EU産業信頼感指数', frequency: '月次', unit: '指数' },
  { datasetCode: 'ei_bsci_m', name: 'EU消費者信頼感指数', frequency: '月次', unit: '指数' },
  { datasetCode: 'sts_inpr_m', name: 'EU鉱工業生産指数', frequency: '月次', unit: '指数' },
  { datasetCode: 'nama_10_gdp', name: 'EU GDP（詳細）', frequency: '四半期', unit: '百万ユーロ' },
  { datasetCode: 'lfsi_emp_a', name: 'EU雇用率', frequency: '年次', unit: '%' },
  { datasetCode: 'ilc_di01', name: 'EU所得分布（ジニ係数）', frequency: '年次', unit: '指数' },
  { datasetCode: 'sdg_08_10', name: 'EU実質GDP成長率', frequency: '年次', unit: '%' },
  { datasetCode: 'tps00001', name: 'EU人口', frequency: '年次', unit: '人' },
];

/** EU主要国コード（ISO alpha-2、Eurostat用） */
export const EUROSTAT_COUNTRIES = [
  'DE', 'FR', 'IT', 'ES', 'NL',
  'BE', 'AT', 'FI', 'IE', 'PT',
];

/** BIS（国際決済銀行）で取得するデータセット — SDMX API */
export interface BisDatasetDef {
  datasetCode: string;
  key: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const BIS_DATASETS: BisDatasetDef[] = [
  { datasetCode: 'WS_CBPOL', key: 'D..', name: '政策金利', frequency: '日次', unit: '%' },
  { datasetCode: 'WS_EER', key: 'M.N.B.US+JP+XM+GB+CN', name: '実効為替レート（名目）', frequency: '月次', unit: '指数' },
  { datasetCode: 'WS_EER', key: 'M.R.B.US+JP+XM+GB+CN', name: '実効為替レート（実質）', frequency: '月次', unit: '指数' },
  { datasetCode: 'WS_TC', key: 'A.US+JP+DE+GB+FR.3P.1.TO1.A.A', name: '総与信対GDP比', frequency: '年次', unit: '%' },
  { datasetCode: 'WS_SPP', key: 'Q.N.US+JP+DE+GB+AU', name: '住宅価格指数', frequency: '四半期', unit: '指数' },
  { datasetCode: 'WS_LONG_CPI', key: 'A.US+JP+DE+GB+FR', name: '長期CPI系列', frequency: '年次', unit: '指数' },
];

/** WTO（世界貿易機関）で取得する指標 — Timeseries API */
export interface WtoIndicatorDef {
  indicatorCode: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const WTO_INDICATORS: WtoIndicatorDef[] = [
  { indicatorCode: 'ITS_MTV_AX', name: '商品輸出額', frequency: '年次', unit: '百万USドル' },
  { indicatorCode: 'ITS_MTV_AM', name: '商品輸入額', frequency: '年次', unit: '百万USドル' },
  { indicatorCode: 'ITS_CS_AX', name: 'サービス輸出額', frequency: '年次', unit: '百万USドル' },
  { indicatorCode: 'ITS_CS_AM', name: 'サービス輸入額', frequency: '年次', unit: '百万USドル' },
  { indicatorCode: 'TP_A_0010', name: '平均適用関税率', frequency: '年次', unit: '%' },
];

/** WTO用国コード */
export const WTO_COUNTRIES: Record<string, string> = {
  '840': 'USA', '392': 'JPN', '276': 'DEU', '826': 'GBR', '250': 'FRA',
  '156': 'CHN', '356': 'IND', '076': 'BRA', '410': 'KOR', '036': 'AUS',
  '124': 'CAN', '380': 'ITA', '484': 'MEX', '360': 'IDN', '792': 'TUR',
};

/** FAO（国連食糧農業機関）で取得する指標 — FAOSTAT API */
export interface FaoIndicatorDef {
  domainCode: string;
  elementCode: string;
  itemCode: string;
  name: string;
  frequency: Frequency;
  unit: string;
}

export const FAO_INDICATORS: FaoIndicatorDef[] = [
  { domainCode: 'FS', elementCode: '6121', itemCode: '21001', name: '食料不足蔓延率', frequency: '年次', unit: '%' },
  { domainCode: 'FS', elementCode: '6122', itemCode: '21004', name: '食料安全保障指数', frequency: '年次', unit: '指数' },
  { domainCode: 'QCL', elementCode: '5510', itemCode: '15', name: '穀物生産量', frequency: '年次', unit: 'トン' },
  { domainCode: 'PP', elementCode: '5532', itemCode: '22013', name: '食料生産者価格指数', frequency: '年次', unit: '指数' },
  { domainCode: 'FO', elementCode: '5610', itemCode: '2901', name: '食料供給量（カロリー/人/日）', frequency: '年次', unit: 'kcal/人/日' },
  { domainCode: 'EI', elementCode: '7273', itemCode: '6801', name: '農業排出量（CO2換算）', frequency: '年次', unit: 'ギガグラム' },
  { domainCode: 'RL', elementCode: '5110', itemCode: '6601', name: '農地面積', frequency: '年次', unit: '1000ha' },
];

/** FAO用国コード（FAO M49） */
export const FAO_COUNTRIES: Record<string, string> = {
  '231': 'USA', '110': 'JPN', '79': 'DEU', '229': 'GBR', '68': 'FRA',
  '41': 'CHN', '100': 'IND', '21': 'BRA', '117': 'KOR', '10': 'AUS',
  '33': 'CAN', '106': 'ITA', '138': 'MEX', '101': 'IDN', '223': 'TUR',
};
