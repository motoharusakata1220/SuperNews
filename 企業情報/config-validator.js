import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function validateConfig(config) {
  if (!config.edinet) {
    throw new Error('EDINET設定は必須です');
  }

  if (!config.edinet.baseUrl) {
    throw new Error('EDINET baseUrlは必須です');
  }

  if (!config.edinet.docTypes || config.edinet.docTypes.length === 0) {
    throw new Error('対象書類種別(docTypes)が1つ以上必要です');
  }

  return true;
}

export function loadConfig() {
  const configPath = join(__dirname, 'config.json');
  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw);
  validateConfig(config);
  return config;
}
