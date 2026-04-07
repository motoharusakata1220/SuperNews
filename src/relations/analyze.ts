import * as fs from 'fs';
import * as path from 'path';
import { buildRelationGraph } from './relation-graph';
import { NewsArticleWithId } from './types';

/** 世界情勢のニュースJSONを読み込んでNewsArticleWithIdに変換する */
function loadNewsArticles(newsDir: string): NewsArticleWithId[] {
  if (!fs.existsSync(newsDir)) return [];

  const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.json'));
  const articles: NewsArticleWithId[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(newsDir, file), 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.articles)) {
        for (const a of parsed.articles) {
          articles.push({
            id: a.url || `${file}-${articles.length}`,
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

  return articles;
}

/** メイン: 関係性分析を実行してJSONを出力する */
function main(): void {
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const newsDir = path.join(projectRoot, '世界情勢', 'output');
  const outputDir = path.join(projectRoot, 'output');

  console.log('ニュース記事を読み込み中...');
  const articles = loadNewsArticles(newsDir);
  console.log(`${articles.length}件の記事を取得`);

  console.log('関係性を分析中...');
  const graph = buildRelationGraph(articles);
  console.log(`ニュース間関係: ${graph.newsRelations.length}件`);
  console.log(`国家間関係: ${graph.countryRelations.length}件`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, '関係性.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`出力: ${outputPath}`);
}

main();
