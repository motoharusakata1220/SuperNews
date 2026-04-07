#!/usr/bin/env node

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, getRequiredEnv } from './env-loader.js';
import { loadConfig } from './config-validator.js';
import { EdinetClient } from './edinet-client.js';
import { parseDocumentInfo } from './company-parser.js';
import { classifyByIndustry } from './industry-classifier.js';
import { fetchStockPrices, parseStooqCsv } from './stock-price-client.js';
import { calcMovingAverage, detectGoldenCross } from './golden-cross.js';
import { generateReport } from './report-generator.js';
import { loadCodeListFromCache } from './codelist-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv(join(__dirname, '.env'));

async function main() {
  const args = process.argv.slice(2);
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = args[0] || thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = args[1] || today.toISOString().split('T')[0];

  console.log(`企業情報収集を開始します...`);
  console.log(`期間: ${startDate} 〜 ${endDate}`);

  const config = loadConfig();

  // EDINET API から書類一覧を取得
  const apiKey = getRequiredEnv('EDINET_API_KEY');
  const client = new EdinetClient(config.edinet.baseUrl, apiKey);

  console.log('EDINET API から書類一覧を取得中...');
  const allDocuments = await client.fetchDocumentListForRange(startDate, endDate);
  console.log(`取得した書類数: ${allDocuments.length}件`);

  // 対象書類タイプでフィルタ
  const filtered = client.filterByDocTypes(allDocuments, config.edinet.docTypes);
  console.log(`対象書類数: ${filtered.length}件`);

  // パース
  const parsed = filtered.map(parseDocumentInfo);

  // EDINETコードリストから業種マップを構築
  const codeListCachePath = join(__dirname, 'codelist-cache.csv');
  const industryMap = loadCodeListFromCache(codeListCachePath);
  console.log(`業種マップ: ${industryMap.size}社`);
  const classifiedData = classifyByIndustry(parsed, industryMap);
  console.log(`業種数: ${classifiedData.size}`);

  // ゴールデンクロス検出（証券コードがある書類のみ）
  const goldenCrossResults = [];
  const securityCodes = new Set();
  for (const doc of parsed) {
    if (doc.securityCode) securityCodes.add(doc.securityCode);
  }

  const { shortMaPeriod, longMaPeriod } = config.stockPrice;
  console.log(`株価分析中... (${securityCodes.size}銘柄)`);

  for (const code of securityCodes) {
    try {
      const prices = await fetchStockPrices(code);
      if (prices.length < longMaPeriod) continue;

      const closes = prices.map((p) => p.close);
      const shortMa = calcMovingAverage(closes, shortMaPeriod);
      const longMa = calcMovingAverage(closes, longMaPeriod);
      const crosses = detectGoldenCross(shortMa, longMa);

      if (crosses.length > 0) {
        const doc = parsed.find((d) => d.securityCode === code);
        const info = doc ? industryMap.get(doc.edinetCode) : undefined;
        goldenCrossResults.push({
          name: info?.name || doc?.companyName || code,
          code,
          industry: info?.industry || 'その他・不明',
          date: prices[crosses[crosses.length - 1]]?.date || '-',
        });
      }
    } catch {
      // 株価取得失敗はスキップ
    }
  }

  console.log(`ゴールデンクロス検出: ${goldenCrossResults.length}銘柄`);

  // レポート生成（分析結果は空Mapで渡す — Claude分析は別途）
  const analysisResults = new Map();
  const outputDir = join(__dirname, '..', 'output', '企業情報');
  const filePath = generateReport(classifiedData, analysisResults, goldenCrossResults, startDate, endDate, outputDir);
  console.log(`レポートを生成しました: ${filePath}`);
}

main().catch((err) => {
  console.error('エラーが発生しました:', err.message);
  process.exit(1);
});
