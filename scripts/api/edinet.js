#!/usr/bin/env node
/**
 * EDINET API 連携スクリプト
 *
 * 金融庁公式API。有価証券報告書・決算短信のPDF/XBRLを取得。
 * APIキー不要（v2は公開API）。
 *
 * 使い方:
 *   node scripts/api/edinet.js [日付: YYYY-MM-DD]
 *
 * 出力:
 *   docs/data/edinet_filings.json - 直近の開示一覧
 *   docs/data/edinet_pdfs/       - ダウンロードしたPDF
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = process.env.SUPERNEWS_ROOT || path.resolve(__dirname, '../..');
const BASE = 'https://api.edinet-fsa.go.jp/api/v2';
const PDF_DIR = path.join(ROOT, 'docs/data/edinet_pdfs');

// --- HTTP GET ---
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}`));
        else resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

// --- バイナリダウンロード ---
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', e => {
      fs.unlink(dest, () => {});
      reject(e);
    });
  });
}

// --- 開示書類一覧取得 ---
async function fetchDocuments(date) {
  // type=2: 有価証券報告書・四半期報告書等
  const url = `${BASE}/documents.json?date=${date}&type=2`;
  const res = await httpGet(url);
  return (res.results || []).filter(d =>
    d.docTypeCode === '120' || // 有価証券報告書
    d.docTypeCode === '130' || // 四半期報告書
    d.docTypeCode === '140' || // 半期報告書
    d.docTypeCode === '350' || // 決算短信
    d.docTypeCode === '360'    // 四半期決算短信
  );
}

// --- PDF取得 ---
async function downloadPdf(docId, filename) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
  const url = `${BASE}/documents/${docId}?type=1`; // type=1 = PDF
  const dest = path.join(PDF_DIR, filename);
  await downloadFile(url, dest);
  return dest;
}

// --- メイン ---
async function main() {
  const targetDate = process.argv[2] || new Date().toISOString().slice(0, 10);
  console.log(`=== EDINET API データ取得 (${targetDate}) ===`);

  // 直近7日分を取得
  const allDocs = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    try {
      const docs = await fetchDocuments(dateStr);
      allDocs.push(...docs.map(doc => ({ ...doc, 取得対象日: dateStr })));
      console.log(`  ${dateStr}: ${docs.length}件`);
    } catch (e) {
      console.log(`  ${dateStr}: 取得失敗 (${e.message})`);
    }
  }

  console.log(`合計: ${allDocs.length}件`);

  // 決算短信のみ抽出してJSON保存
  const filings = allDocs.map(d => ({
    docID: d.docID,
    提出日: d.submitDateTime || '',
    企業名: d.filerName || '',
    EDINETコード: d.edinetCode || '',
    証券コード: d.secCode || '',
    書類種別: d.docTypeCode === '120' ? '有価証券報告書' :
              d.docTypeCode === '130' ? '四半期報告書' :
              d.docTypeCode === '350' ? '決算短信' :
              d.docTypeCode === '360' ? '四半期決算短信' : d.docDescription || '',
    タイトル: d.docDescription || '',
    PDF_URL: `https://api.edinet-fsa.go.jp/api/v2/documents/${d.docID}?type=1`,
    XBRL_URL: `https://api.edinet-fsa.go.jp/api/v2/documents/${d.docID}?type=5`,
    ソース: 'EDINET API (金融庁)',
  }));

  const outPath = path.join(ROOT, 'docs/data/edinet_filings.json');
  fs.writeFileSync(outPath, JSON.stringify({
    更新日時: new Date().toISOString(),
    対象期間: `${targetDate}から7日間`,
    ソース: 'EDINET API (金融庁)',
    ソースURL: 'https://disclosure2.edinet-fsa.go.jp/',
    件数: filings.length,
    開示一覧: filings,
  }, null, 2), 'utf-8');

  console.log(`→ ${outPath} (${filings.length}件)`);

  // 主要企業の決算短信PDFを最大5件ダウンロード
  const kessan = filings.filter(f => f.書類種別.includes('決算短信')).slice(0, 5);
  if (kessan.length > 0) {
    console.log(`\n決算短信PDFダウンロード (${kessan.length}件):`);
    for (const f of kessan) {
      try {
        const filename = `${f.証券コード || 'unknown'}_${f.提出日.slice(0,10)}.pdf`;
        await downloadPdf(f.docID, filename);
        console.log(`  ✅ ${f.企業名} → ${filename}`);
      } catch (e) {
        console.log(`  ❌ ${f.企業名}: ${e.message}`);
      }
    }
  }

  console.log('\n=== 完了 ===');
}

main().catch(e => { console.error('エラー:', e.message); process.exit(1); });
