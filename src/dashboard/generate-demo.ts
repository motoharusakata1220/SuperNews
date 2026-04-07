import * as fs from 'fs';
import * as path from 'path';
import { buildDashboardHtml, DashboardData } from './dashboard-generator';

const OUTPUT_PATH = path.resolve(__dirname, '..', '..', 'output', 'ダッシュボード.html');

/** デモ用サンプルデータ（実際のWorldBank近似値） */
const demoData: DashboardData = {
  generatedAt: new Date().toISOString(),
  countries: {
    USA: { countryCode: 'USA', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 25.46e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 2.5, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '一人当たりGDP', value: 76330, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'インフレ率（CPI）', value: 4.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 3.6, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 331900000, date: '2023', unit: '人', source: 'WorldBank' },
      { indicator: '平均寿命', value: 77.5, date: '2022', unit: '歳', source: 'WorldBank' },
      { indicator: '一人当たりCO2排出量', value: 14.3, date: '2021', unit: 'トン', source: 'WorldBank' },
      { indicator: '政府債務対GDP比', value: 123.3, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '実質金利', value: 2.1, date: '2023', unit: '%', source: 'WorldBank' },
    ]},
    JPN: { countryCode: 'JPN', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 4.23e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 1.9, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '一人当たりGDP', value: 33950, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'インフレ率（CPI）', value: 3.3, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 2.6, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 125124000, date: '2023', unit: '人', source: 'WorldBank' },
      { indicator: '平均寿命', value: 84.8, date: '2022', unit: '歳', source: 'WorldBank' },
      { indicator: '一人当たりCO2排出量', value: 8.5, date: '2021', unit: 'トン', source: 'WorldBank' },
      { indicator: '政府債務対GDP比', value: 252.4, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '実質金利', value: -0.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '為替レート（対USドル）', value: 151.0, date: '2024-03', unit: '現地通貨/USドル', source: 'IMF' },
    ]},
    DEU: { countryCode: 'DEU', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 4.46e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: -0.3, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 3.0, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 84360000, date: '2023', unit: '人', source: 'WorldBank' },
      { indicator: '平均寿命', value: 81.0, date: '2022', unit: '歳', source: 'WorldBank' },
    ]},
    GBR: { countryCode: 'GBR', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 3.16e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 0.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 4.0, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 67790000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    FRA: { countryCode: 'FRA', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 3.05e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 0.9, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 7.3, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 67750000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    CHN: { countryCode: 'CHN', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 17.96e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 5.2, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '一人当たりGDP', value: 12720, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: '失業率', value: 5.2, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 1410710000, date: '2023', unit: '人', source: 'WorldBank' },
      { indicator: '平均寿命', value: 78.2, date: '2022', unit: '歳', source: 'WorldBank' },
    ]},
    IND: { countryCode: 'IND', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 3.73e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 7.8, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 4.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 1428630000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    BRA: { countryCode: 'BRA', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 2.17e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 2.9, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 7.9, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 214300000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    KOR: { countryCode: 'KOR', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 1.71e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 1.4, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 2.7, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 51740000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    AUS: { countryCode: 'AUS', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 1.69e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 2.0, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 3.7, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 26470000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    CAN: { countryCode: 'CAN', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 2.14e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 1.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 5.4, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 40100000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    ITA: { countryCode: 'ITA', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 2.19e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 0.7, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 7.6, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 58940000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    MEX: { countryCode: 'MEX', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 1.79e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 3.2, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 2.8, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 128900000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    IDN: { countryCode: 'IDN', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 1.42e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 5.1, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 5.3, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 277530000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
    TUR: { countryCode: 'TUR', indicators: [
      { indicator: 'GDP（名目、USドル）', value: 1.11e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
      { indicator: 'GDP成長率', value: 4.5, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: 'インフレ率（CPI）', value: 53.9, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '失業率', value: 9.4, date: '2023', unit: '%', source: 'WorldBank' },
      { indicator: '総人口', value: 85280000, date: '2023', unit: '人', source: 'WorldBank' },
    ]},
  },
  corporateReports: [
    { company: 'トヨタ自動車', code: '7203', latestDate: '2026-03-15', documentCount: 5 },
    { company: 'ソニーグループ', code: '6758', latestDate: '2026-02-14', documentCount: 3 },
    { company: 'ソフトバンクグループ', code: '9984', latestDate: '2026-03-28', documentCount: 4 },
  ],
  investmentArticles: [
    { title: '【情報戦の真相】トランプとイランが同時に嘘をつく理由と、日経44％の空売り買戻し爆弾', date: '2026-04-02', url: 'https://www.youtube.com/watch?v=ejHKf2UUBlo' },
  ],
  worldNews: [
    { title: 'Iran rejects US ceasefire claims', description: 'Iran denies negotiations with the United States', url: 'https://example.com/news1', publishedAt: '2026-04-03T10:00:00Z', source: 'BBC', category: '地域紛争' },
    { title: 'Global markets react to oil surge', description: 'Oil prices hit 113 USD', url: 'https://example.com/news2', publishedAt: '2026-04-03T08:00:00Z', source: 'Reuters', category: '経済ニュース' },
    { title: 'AI規制をめぐる国際会議', description: 'G7がAI規制フレームワークを協議', url: 'https://example.com/news3', publishedAt: '2026-04-02T14:00:00Z', source: 'NHK', category: 'テクノロジー' },
  ],
};

const html = buildDashboardHtml(demoData);
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
console.log(`デモダッシュボード生成完了: ${OUTPUT_PATH}`);
console.log(`  15ヶ国のサンプルデータ付き`);
