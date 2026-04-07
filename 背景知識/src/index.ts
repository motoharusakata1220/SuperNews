import * as fs from 'fs';
import * as path from 'path';
import { loadKnowledgeFiles, assembleKnowledgeBase } from './loader/knowledge-loader';

const PROJECT_DIR = path.resolve(__dirname, '..', '..');
const KNOWLEDGE_DIR = path.join(PROJECT_DIR, 'knowledge');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, '背景知識.json');

function main(): void {
  console.log('背景知識を集約中...');
  console.log(`知識ディレクトリ: ${KNOWLEDGE_DIR}`);

  const entries = loadKnowledgeFiles(KNOWLEDGE_DIR);
  console.log(`読み込んだエントリ数: ${entries.length}`);

  const kb = assembleKnowledgeBase(entries);

  const countryCount = Object.keys(kb.countryContexts).length;
  console.log(`  国別コンテキスト: ${countryCount}件`);
  console.log(`  テーマ別背景: ${kb.themeBackgrounds.length}件`);
  console.log(`  経済史: ${kb.economicHistory.length}件`);
  console.log(`  タイムライン: ${kb.timelines.length}件`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(kb, null, 2), 'utf-8');
  console.log(`\n出力: ${OUTPUT_FILE}`);
}

main();
