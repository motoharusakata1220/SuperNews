import * as fs from 'fs';
import * as path from 'path';
import { loadEconomicIndicators, loadCorporateReports, loadInvestmentArticles, loadWorldNews, loadAllData } from './data-loader';

const TMP = path.join(__dirname, '__test_tmp__');

beforeEach(() => {
  fs.mkdirSync(TMP, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
});

describe('loadEconomicIndicators', () => {
  test('JSONファイルがないとき空オブジェクトを返す', () => {
    const result = loadEconomicIndicators(TMP);
    expect(result).toEqual({});
  });

  test('年次指標JSONがあるとき国別にグループ化される', () => {
    const data = {
      generatedAt: '2026-04-04T00:00:00Z',
      frequency: '年次',
      count: 2,
      data: [
        { country: 'Japan', countryCode: 'JPN', indicator: 'GDP成長率', value: 1.9, date: '2023', source: 'WorldBank', unit: '%' },
        { country: 'Japan', countryCode: 'JPN', indicator: '失業率', value: 2.6, date: '2023', source: 'WorldBank', unit: '%' },
        { country: 'United States', countryCode: 'USA', indicator: 'GDP成長率', value: 2.5, date: '2023', source: 'WorldBank', unit: '%' },
      ],
    };
    fs.writeFileSync(path.join(TMP, '年次指標.json'), JSON.stringify(data));

    const result = loadEconomicIndicators(TMP);
    expect(Object.keys(result)).toEqual(['JPN', 'USA']);
    expect(result['JPN'].indicators).toHaveLength(2);
    expect(result['USA'].indicators).toHaveLength(1);
  });

  test('同じ指標で複数日付があるとき最新のみ保持する', () => {
    const data = {
      generatedAt: '2026-04-04T00:00:00Z',
      frequency: '年次',
      count: 2,
      data: [
        { country: 'Japan', countryCode: 'JPN', indicator: 'GDP成長率', value: 1.5, date: '2022', source: 'WorldBank', unit: '%' },
        { country: 'Japan', countryCode: 'JPN', indicator: 'GDP成長率', value: 1.9, date: '2023', source: 'WorldBank', unit: '%' },
      ],
    };
    fs.writeFileSync(path.join(TMP, '年次指標.json'), JSON.stringify(data));

    const result = loadEconomicIndicators(TMP);
    expect(result['JPN'].indicators).toHaveLength(1);
    expect(result['JPN'].indicators[0].value).toBe(1.9);
    expect(result['JPN'].indicators[0].date).toBe('2023');
  });
});

describe('loadCorporateReports', () => {
  test('企業情報ディレクトリがないとき空配列を返す', () => {
    const result = loadCorporateReports(TMP);
    expect(result).toEqual([]);
  });

  test('Markdownファイルがあるとき企業情報を抽出する', () => {
    const dir = path.join(TMP, '企業情報');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'report.md'), `# 企業情報レポート

## トヨタ自動車 (7203)

| 種別 | 内容 | 対象期間 | 提出日 | docID |
|------|------|----------|--------|-------|
| 有価証券報告書 | 2024年度 | 2024-03-31 | 2024-06-15 | DOC001 |
| 四半期報告書 | Q3 | 2024-12-31 | 2025-02-14 | DOC002 |
`);

    const result = loadCorporateReports(TMP);
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('トヨタ自動車');
    expect(result[0].code).toBe('7203');
    expect(result[0].latestDate).toBe('2025-02-14');
  });
});

describe('loadInvestmentArticles', () => {
  test('投資レポートHTMLがないとき空配列を返す', () => {
    const result = loadInvestmentArticles(TMP);
    expect(result).toEqual([]);
  });

  test('投資レポートHTMLがあるとき記事を抽出する', () => {
    fs.writeFileSync(path.join(TMP, '投資レポート.html'), `<!DOCTYPE html>
<html><body>
<div class="card">
  <div class="date">2026-04-02</div>
  <h2>テスト記事タイトル</h2>
  <a href="https://example.com/video">動画</a>
</div></div>
</body></html>`);

    const result = loadInvestmentArticles(TMP);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('テスト記事タイトル');
    expect(result[0].date).toBe('2026-04-02');
    expect(result[0].url).toBe('https://example.com/video');
  });
});

describe('loadWorldNews', () => {
  test('ディレクトリがないとき空配列を返す', () => {
    const result = loadWorldNews(path.join(TMP, 'nonexistent'));
    expect(result).toEqual([]);
  });

  test('カテゴリ別JSONからニュースを読み込む', () => {
    const dir = path.join(TMP, 'world-news');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '世界情勢.json'), JSON.stringify({
      generatedAt: '2026-04-04T00:00:00Z',
      category: '世界情勢',
      count: 1,
      articles: [
        { title: 'テストニュース', description: '概要', url: 'https://example.com', publishedAt: '2026-04-03T10:00:00Z', source: 'NHK', category: '世界情勢' },
      ],
    }));

    const result = loadWorldNews(dir);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('テストニュース');
    expect(result[0].source).toBe('NHK');
  });
});

describe('loadAllData', () => {
  test('プロジェクトルートからデータを統合してDashboardDataを返す', () => {
    const econDir = path.join(TMP, '経済指標', 'output');
    fs.mkdirSync(econDir, { recursive: true });

    const outputDir = path.join(TMP, 'output');
    fs.mkdirSync(outputDir, { recursive: true });

    const worldDir = path.join(TMP, '世界情勢', 'output');
    fs.mkdirSync(worldDir, { recursive: true });

    const result = loadAllData(TMP);
    expect(result.generatedAt).toBeTruthy();
    expect(result.countries).toEqual({});
    expect(result.corporateReports).toEqual([]);
    expect(result.investmentArticles).toEqual([]);
    expect(result.worldNews).toEqual([]);
  });
});
