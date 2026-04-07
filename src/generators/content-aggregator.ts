import * as fs from 'fs';
import * as path from 'path';
import type { CategoryName, SourceArticle } from './types';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CATEGORIES: readonly CategoryName[] = [
  '投資',
  '世界情勢',
  '企業情報',
  '経済指標',
  '背景知識',
];

/** Markdownファイルからタイトルと概要を抽出 */
export function extractFromMarkdown(
  content: string,
  category: CategoryName,
  filePath: string,
): SourceArticle {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const titleLine = lines.find((l) => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#+\s*/, '') : path.basename(filePath, '.md');
  const summaryLines = lines
    .filter((l) => !l.startsWith('#') && !l.startsWith('---'))
    .slice(0, 5);
  const summary = summaryLines.join(' ').slice(0, 300);

  return { title, summary, category };
}

/** JSONファイルからソース記事を抽出 */
export function extractFromJson(
  content: string,
  category: CategoryName,
): readonly SourceArticle[] {
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.slice(0, 10).map((item: Record<string, unknown>) => ({
        title: String(item.title ?? item.name ?? '不明'),
        summary: String(item.summary ?? item.description ?? item.content ?? '').slice(0, 300),
        category,
      }));
    }
    return [
      {
        title: String(data.title ?? data.name ?? '分析データ'),
        summary: JSON.stringify(data).slice(0, 300),
        category,
      },
    ];
  } catch {
    return [];
  }
}

/** 指定ディレクトリ内の情報ファイルを再帰的に収集 */
export function collectFilesFromDir(dirPath: string): readonly string[] {
  if (!fs.existsSync(dirPath)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      results.push(...collectFilesFromDir(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** 全カテゴリから情報を集約 */
export function aggregateAllContent(): readonly SourceArticle[] {
  const articles: SourceArticle[] = [];

  for (const category of CATEGORIES) {
    const categoryDir = path.join(PROJECT_ROOT, category);
    const files = collectFilesFromDir(categoryDir);

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (filePath.endsWith('.md')) {
          articles.push(extractFromMarkdown(content, category, filePath));
        } else if (filePath.endsWith('.json')) {
          articles.push(...extractFromJson(content, category));
        }
      } catch {
        // ファイル読み取りエラーはスキップ
      }
    }
  }

  // outputフォルダからも収集
  const outputDir = path.join(PROJECT_ROOT, 'output');
  const outputFiles = collectFilesFromDir(outputDir);
  for (const filePath of outputFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (filePath.endsWith('.md')) {
        articles.push(extractFromMarkdown(content, '背景知識', filePath));
      } else if (filePath.endsWith('.json')) {
        articles.push(...extractFromJson(content, '背景知識'));
      }
    } catch {
      // スキップ
    }
  }

  return articles;
}
