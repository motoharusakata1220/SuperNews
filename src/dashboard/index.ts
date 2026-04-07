import * as fs from 'fs';
import * as path from 'path';
import { loadAllData } from './data-loader';
import { buildDashboardHtml } from './dashboard-generator';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'output', 'ダッシュボード.html');

function main(): void {
  console.log('データを読み込み中...');
  const data = loadAllData(PROJECT_ROOT);

  const countryCount = Object.keys(data.countries).length;
  const indicatorCount = Object.values(data.countries).reduce((s, c) => s + c.indicators.length, 0);
  console.log(`  国数: ${countryCount}`);
  console.log(`  指標数: ${indicatorCount}`);
  console.log(`  企業レポート: ${data.corporateReports.length}件`);
  console.log(`  投資記事: ${data.investmentArticles.length}件`);

  console.log('ダッシュボードHTMLを生成中...');
  const html = buildDashboardHtml(data);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
  console.log(`生成完了: ${OUTPUT_PATH}`);
}

main();
