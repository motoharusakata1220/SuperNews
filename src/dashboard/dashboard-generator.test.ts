import { buildDashboardHtml, DashboardData, CountryData } from './dashboard-generator';

function makeSampleData(): DashboardData {
  return {
    generatedAt: '2026-04-04T12:00:00Z',
    countries: {
      JPN: {
        countryCode: 'JPN',
        indicators: [
          { indicator: 'GDP（名目、USドル）', value: 4.94e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
          { indicator: 'GDP成長率', value: 1.9, date: '2023', unit: '%', source: 'WorldBank' },
          { indicator: '失業率', value: 2.6, date: '2023', unit: '%', source: 'WorldBank' },
          { indicator: '総人口', value: 125124000, date: '2023', unit: '人', source: 'WorldBank' },
        ],
      },
      USA: {
        countryCode: 'USA',
        indicators: [
          { indicator: 'GDP（名目、USドル）', value: 25.46e12, date: '2023', unit: 'USドル', source: 'WorldBank' },
          { indicator: '失業率', value: 3.6, date: '2023', unit: '%', source: 'WorldBank' },
        ],
      },
    },
    corporateReports: [
      { company: 'トヨタ自動車', code: '7203', latestDate: '2026-03-15', documentCount: 3 },
    ],
    investmentArticles: [
      { title: 'テスト記事', date: '2026-04-02', url: 'https://example.com' },
    ],
    worldNews: [
      { title: 'テストニュース', description: '概要', url: 'https://example.com/news', publishedAt: '2026-04-03T10:00:00Z', source: 'NHK', category: '世界情勢' },
    ],
  };
}

describe('buildDashboardHtml', () => {
  let html: string;

  beforeAll(() => {
    html = buildDashboardHtml(makeSampleData());
  });

  test('有効なHTMLドキュメントが生成されるとき<!DOCTYPE html>で始まる', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/);
  });

  test('HTMLにD3.jsとTopoJSONのCDNリンクが含まれる', () => {
    expect(html).toContain('d3js.org');
    expect(html).toContain('topojson');
  });

  test('対象国の日本語名がHTMLに含まれる', () => {
    expect(html).toContain('日本');
    expect(html).toContain('アメリカ');
  });

  test('国別データがJSON形式でHTMLに埋め込まれる', () => {
    expect(html).toContain('JPN');
    expect(html).toContain('USA');
  });

  test('経済指標の値がHTMLに埋め込まれる', () => {
    expect(html).toContain('GDP');
    expect(html).toContain('失業率');
  });

  test('企業情報セクションが含まれる', () => {
    expect(html).toContain('トヨタ自動車');
    expect(html).toContain('7203');
  });

  test('投資記事セクションが含まれる', () => {
    expect(html).toContain('テスト記事');
  });

  test('データが空でもエラーにならない', () => {
    const emptyData: DashboardData = {
      generatedAt: '2026-04-04T12:00:00Z',
      countries: {},
      corporateReports: [],
      investmentArticles: [],
      worldNews: [],
    };
    const result = buildDashboardHtml(emptyData);
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  test('世界地図のSVG要素が含まれる', () => {
    expect(html).toContain('id="world-map"');
  });

  test('タブ切り替えUIが含まれる', () => {
    expect(html).toContain('経済指標');
    expect(html).toContain('企業');
    expect(html).toContain('投資');
    expect(html).toContain('世界情勢');
  });

  test('世界情勢ニュースが含まれる', () => {
    expect(html).toContain('テストニュース');
    expect(html).toContain('NHK');
  });
});
