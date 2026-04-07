import * as fs from 'fs';
import * as path from 'path';
import { Frequency, FrequencyGrouped } from '../types';

const FILE_NAMES: Record<Frequency, string> = {
  '日次': '日次指標.json',
  '月次': '月次指標.json',
  '四半期': '四半期指標.json',
  '年次': '年次指標.json',
};

export function writeFrequencyFiles(data: FrequencyGrouped, outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [frequency, items] of Object.entries(data) as [Frequency, typeof data[Frequency]][]) {
    const output = {
      generatedAt: new Date().toISOString(),
      frequency,
      count: items.length,
      data: items,
    };

    const filePath = path.join(outputDir, FILE_NAMES[frequency]);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
