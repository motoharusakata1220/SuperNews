import * as fs from 'fs';
import * as path from 'path';
import { CategoryGrouped } from '../types';

export function writeCategoryFiles(grouped: CategoryGrouped, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [category, articles] of Object.entries(grouped)) {
    const output = {
      generatedAt: new Date().toISOString(),
      category,
      count: articles.length,
      articles,
    };

    const filePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
