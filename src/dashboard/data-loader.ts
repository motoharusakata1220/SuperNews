import * as fs from 'fs';
import * as path from 'path';
import { DashboardData, CountryData, IndicatorEntry, CorporateReport, InvestmentArticle, WorldNewsItem, KnowledgeBase, NewsRelationData, CountryRelationData } from './dashboard-generator';

/** 経済指標JSONファイルのエンベロープ */
interface IndicatorFile {
  generatedAt: string;
  frequency: string;
  count: number;
  data: Array<{
    country: string;
    countryCode: string;
    indicator: string;
    value: number | null;
    date: string;
    source: string;
    unit: string;
  }>;
}

/** 経済指標JSONを読み込み、国別にグループ化する */
export function loadEconomicIndicators(outputDir: string): Record<string, CountryData> {
  const files = ['年次指標.json', '四半期指標.json', '月次指標.json', '日次指標.json'];
  const countries: Record<string, CountryData> = {};

  for (const filename of files) {
    const filePath = path.join(outputDir, filename);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: IndicatorFile = JSON.parse(raw);

    for (const item of parsed.data) {
      const code = item.countryCode;
      if (!countries[code]) {
        countries[code] = { countryCode: code, indicators: [] };
      }

      // 同じ指標の最新データのみ保持
      const existing = countries[code].indicators.find(
        i => i.indicator === item.indicator && i.source === item.source
      );
      if (!existing) {
        countries[code].indicators.push({
          indicator: item.indicator,
          value: item.value,
          date: item.date,
          unit: item.unit,
          source: item.source,
        });
      } else if (item.date > existing.date) {
        existing.value = item.value;
        existing.date = item.date;
      }
    }
  }

  return countries;
}

/** 企業情報Markdownからレポート概要を抽出する */
export function loadCorporateReports(outputDir: string): CorporateReport[] {
  const dirPath = path.join(outputDir, '企業情報');
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  const reports: CorporateReport[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
    // "## トヨタ自動車 (7203)" のようなセクションを探す
    const sections = content.match(/^## (.+?) \((\d{4})\)/gm) || [];
    for (const section of sections) {
      const match = section.match(/^## (.+?) \((\d{4})\)/);
      if (!match) continue;

      const lines = content.split(section)[1]?.split(/^## /m)[0] || '';
      const tableRows = lines.match(/\|.*\|/g) || [];
      const docCount = Math.max(0, tableRows.length - 2); // ヘッダ行とセパレータを除く

      // 提出日の最新を取得
      const dates = lines.match(/\d{4}-\d{2}-\d{2}/g) || [];
      const latestDate = dates.sort().reverse()[0] || '';

      reports.push({
        company: match[1],
        code: match[2],
        latestDate,
        documentCount: docCount,
      });
    }
  }

  return reports;
}

/** 投資レポートHTMLから記事概要を抽出する */
export function loadInvestmentArticles(outputDir: string): InvestmentArticle[] {
  const filePath = path.join(outputDir, '投資レポート.html');
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  const articles: InvestmentArticle[] = [];

  // <div class="date">YYYY-MM-DD</div> と <h2>タイトル</h2> と href="URL" を探す
  const cardPattern = /<div class="card">([\s\S]*?)(?=<div class="card">|<\/body>)/g;
  let match;
  while ((match = cardPattern.exec(content)) !== null) {
    const card = match[1];
    const dateMatch = card.match(/<div class="date">([^<]+)<\/div>/);
    const titleMatch = card.match(/<h2>([^<]+)<\/h2>/);
    const urlMatch = card.match(/href="([^"]+)"/);

    if (titleMatch) {
      articles.push({
        title: titleMatch[1],
        date: dateMatch?.[1] || '',
        url: urlMatch?.[1] || '',
      });
    }
  }

  return articles;
}

/** 世界情勢JSONからニュース記事を読み込む */
export function loadWorldNews(outputDir: string): WorldNewsItem[] {
  if (!fs.existsSync(outputDir)) return [];

  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
  const articles: WorldNewsItem[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(outputDir, file), 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.articles)) {
        for (const a of parsed.articles) {
          articles.push({
            title: a.title || '',
            description: a.description || '',
            url: a.url || '',
            publishedAt: a.publishedAt || '',
            source: a.source || '',
            category: a.category || parsed.category || '',
          });
        }
      }
    } catch {
      // パース失敗はスキップ
    }
  }

  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** 背景知識JSONを読み込む */
export function loadKnowledgeBase(outputFile: string): KnowledgeBase | undefined {
  if (!fs.existsSync(outputFile)) return undefined;

  try {
    const raw = fs.readFileSync(outputFile, 'utf-8');
    return JSON.parse(raw) as KnowledgeBase;
  } catch {
    return undefined;
  }
}

/** 関係性データJSONを読み込む */
export function loadRelations(outputFile: string): { newsRelations: NewsRelationData[]; countryRelations: CountryRelationData[] } {
  if (!fs.existsSync(outputFile)) return { newsRelations: [], countryRelations: [] };

  try {
    const raw = fs.readFileSync(outputFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      newsRelations: parsed.newsRelations || [],
      countryRelations: parsed.countryRelations || [],
    };
  } catch {
    return { newsRelations: [], countryRelations: [] };
  }
}

/** 全データを読み込んでDashboardDataを構築する */
export function loadAllData(projectRoot: string): DashboardData {
  const outputDir = path.join(projectRoot, 'output');
  const economicOutputDir = path.join(projectRoot, '経済指標', 'output');
  const worldNewsOutputDir = path.join(projectRoot, '世界情勢', 'output');
  const knowledgeFile = path.join(projectRoot, '背景知識', 'output', '背景知識.json');
  const relationsFile = path.join(projectRoot, 'output', '関係性.json');

  const relations = loadRelations(relationsFile);

  return {
    generatedAt: new Date().toISOString(),
    countries: loadEconomicIndicators(economicOutputDir),
    corporateReports: loadCorporateReports(outputDir),
    investmentArticles: loadInvestmentArticles(outputDir),
    worldNews: loadWorldNews(worldNewsOutputDir),
    knowledgeBase: loadKnowledgeBase(knowledgeFile),
    newsRelations: relations.newsRelations,
    countryRelations: relations.countryRelations,
  };
}
