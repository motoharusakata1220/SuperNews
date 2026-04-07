import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function generateMarkdown(classifiedData, analysisResults, goldenCrossResults, startDate, endDate) {
  const lines = [];

  lines.push('# 企業情報レポート（全上場企業）');
  lines.push('');
  lines.push(`調査期間: ${startDate} 〜 ${endDate}`);
  lines.push(`生成日時: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // サマリー
  let totalDocs = 0;
  for (const [, docs] of classifiedData) {
    totalDocs += docs.length;
  }
  lines.push(`総書類数: ${totalDocs}件 / 業種数: ${classifiedData.size}`);
  lines.push('');
  lines.push('---');

  // ゴールデンクロス銘柄セクション
  lines.push('');
  lines.push('## ゴールデンクロス銘柄');
  lines.push('');

  if (goldenCrossResults.length === 0) {
    lines.push('該当銘柄なし');
  } else {
    lines.push('| 銘柄 | コード | 業種 | 検出日 |');
    lines.push('|------|--------|------|--------|');
    for (const gc of goldenCrossResults) {
      lines.push(`| ${gc.name} | ${gc.code} | ${gc.industry} | ${gc.date} |`);
    }
  }

  lines.push('');
  lines.push('---');

  // 業種別セクション
  for (const [industry, docs] of classifiedData) {
    lines.push('');
    lines.push(`## ${industry}（${docs.length}件）`);
    lines.push('');

    // 分析結果
    const analysis = analysisResults.get(industry);
    if (analysis) {
      lines.push('### 業界分析');
      lines.push('');
      lines.push(analysis);
      lines.push('');
    }

    // 書類一覧
    lines.push('### 書類一覧');
    lines.push('');
    lines.push('| 企業名 | コード | 種別 | 内容 | 提出日 |');
    lines.push('|--------|--------|------|------|--------|');

    for (const doc of docs) {
      lines.push(`| ${doc.companyName} | ${doc.securityCode} | ${doc.docType} | ${doc.description} | ${doc.submitDate || '-'} |`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

export function generateReport(classifiedData, analysisResults, goldenCrossResults, startDate, endDate, outputDir) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const markdown = generateMarkdown(classifiedData, analysisResults, goldenCrossResults, startDate, endDate);
  const fileName = `企業情報_${startDate}_${endDate}.md`;
  const filePath = join(outputDir, fileName);

  writeFileSync(filePath, markdown, 'utf-8');
  return filePath;
}
