import * as path from 'path';
import { RawArticle, NewsArticle, CategoryGrouped } from './types';
import { RSS_SOURCES } from './config/sources';
import { fetchRss } from './collectors/rss-fetcher';
import { categorizeAll } from './processors/categorizer';
import { deduplicate } from './processors/deduplicator';
import { writeCategoryFiles } from './formatter/json-writer';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');

async function collectFromAllSources(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

  for (const source of RSS_SOURCES) {
    console.log(`[収集中] ${source.name} (${source.region})...`);
    try {
      const articles = await fetchRss(source.url, source.name);
      console.log(`  → ${articles.length}件取得`);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`  → ${source.name} でエラー:`, error);
    }
  }

  return allArticles;
}

function groupByCategory(articles: NewsArticle[]): CategoryGrouped {
  const grouped: Record<string, NewsArticle[]> = {};

  for (const article of articles) {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  }

  return grouped;
}

async function main(): Promise<void> {
  console.log(`=== 世界情勢・経済ニュース収集開���（${RSS_SOURCES.length}ソース��� ===\n`);

  const rawArticles = await collectFromAllSources();
  console.log(`\n合計: ${rawArticles.length}件の記事を取得\n`);

  const categorized = categorizeAll(rawArticles);
  const unique = deduplicate(categorized);
  console.log(`重複除去後: ${unique.length}件\n`);

  const grouped = groupByCategory(unique);

  for (const [category, articles] of Object.entries(grouped)) {
    console.log(`  ${category}: ${articles.length}件`);
  }

  writeCategoryFiles(grouped, OUTPUT_DIR);
  console.log(`\n出力先: ${OUTPUT_DIR}`);
  console.log('=== 収集完了 ===');
}

main().catch(console.error);
