import * as fs from 'fs';
import * as path from 'path';
import { Collector, EconomicIndicator } from './types';
import { WorldBankCollector } from './collectors/world-bank';
import { ImfCollector } from './collectors/imf';
import { EcbCollector } from './collectors/ecb';
import { OecdCollector } from './collectors/oecd';
import { IloCollector } from './collectors/ilo';
import { WhoCollector } from './collectors/who';
import { UnDataCollector } from './collectors/un-data';
import { EurostatCollector } from './collectors/eurostat';
import { BisCollector } from './collectors/bis';
import { WtoCollector } from './collectors/wto';
import { FaoCollector } from './collectors/fao';
import { sortByFrequency } from './aggregator/frequency-sorter';
import { groupByCountry } from './aggregator/country-grouper';
import { writeFrequencyFiles } from './formatter/json-writer';

const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');

async function collectAll(collectors: Collector[]): Promise<EconomicIndicator[]> {
  const results: EconomicIndicator[] = [];

  for (const collector of collectors) {
    console.log(`[収集中] ${collector.name}...`);
    try {
      const data = await collector.collect();
      console.log(`  -> ${data.length}件取得`);
      results.push(...data);
    } catch (error) {
      console.error(`  -> ${collector.name} でエラー発生:`, error);
    }
  }

  return results;
}

async function main(): Promise<void> {
  console.log('=== 経済指標データ収集開始 ===\n');
  console.log('データソース: 11機関の無料API\n');

  const collectors: Collector[] = [
    // 国際経済機関
    new WorldBankCollector(),   // 世界銀行
    new ImfCollector(),         // 国際通貨基金
    new OecdCollector(),        // 経済協力開発機構
    // 中央銀行・金融
    new EcbCollector(),         // 欧州中央銀行
    new BisCollector(),         // 国際決済銀行
    // 労働・健康・社会
    new IloCollector(),         // 国際労働機関
    new WhoCollector(),         // 世界保健機関
    new UnDataCollector(),      // 国連統計
    // 地域統計
    new EurostatCollector(),    // EU統計局
    // 貿易・食料
    new WtoCollector(),         // 世界貿易機関
    new FaoCollector(),         // 国連食糧農業機関
  ];

  const allData = await collectAll(collectors);
  console.log(`\n合計: ${allData.length}件のデータを取得\n`);

  const grouped = sortByFrequency(allData);

  console.log('更新頻度別件数:');
  for (const [freq, items] of Object.entries(grouped)) {
    console.log(`  ${freq}: ${items.length}件`);
  }

  writeFrequencyFiles(grouped, OUTPUT_DIR);

  // 国別にもグループ化して出力
  const byCountry = groupByCountry(allData);
  const countryOutputPath = path.join(OUTPUT_DIR, '国別指標.json');
  const countryOutput = {
    generatedAt: new Date().toISOString(),
    countryCount: Object.keys(byCountry).length,
    totalIndicators: allData.length,
    data: byCountry,
  };
  fs.writeFileSync(countryOutputPath, JSON.stringify(countryOutput, null, 2), 'utf-8');

  console.log(`\n国別: ${Object.keys(byCountry).length}カ国`);
  console.log(`\n=== 出力完了: ${OUTPUT_DIR} ===`);
}

main().catch(console.error);
