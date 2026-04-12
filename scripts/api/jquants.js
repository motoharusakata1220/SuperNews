#!/usr/bin/env node
/**
 * J-Quants API 連携スクリプト
 *
 * JPX公式の無料API。上場企業一覧・財務データ・決算スケジュールを取得。
 *
 * セットアップ:
 *   1. https://application.jpx-jquants.com/ でアカウント登録（無料）
 *   2. メール認証後、リフレッシュトークンを取得
 *   3. .env に JQUANTS_REFRESH_TOKEN=xxx を設定
 *
 * 使い方:
 *   node scripts/api/jquants.js
 *
 * 出力:
 *   docs/data/jp_listed.json   - 全上場企業一覧
 *   docs/data/earnings.json    - 決算データ（更新）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = process.env.SUPERNEWS_ROOT || path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT, '.env');
const BASE = 'https://api.jquants.com/v1';

// --- .env 読み込み ---
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const env = {};
  fs.readFileSync(ENV_PATH, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
  return env;
}

// --- HTTP GET ---
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        else resolve(JSON.parse(data));
      });
    });
    req.on('error', reject);
  });
}

// --- IDトークン取得 ---
async function getIdToken(refreshToken) {
  const url = `${BASE}/token/auth_refresh?refreshtoken=${refreshToken}`;
  const res = await get(url);
  return res.idToken;
}

// --- 上場企業一覧取得 ---
async function fetchListedInfo(token) {
  const url = `${BASE}/listed/info`;
  const res = await get(url, { Authorization: `Bearer ${token}` });
  return res.info || [];
}

// --- 財務データ取得（個別企業） ---
async function fetchStatements(token, code) {
  const url = `${BASE}/fins/statements?code=${code}`;
  const res = await get(url, { Authorization: `Bearer ${token}` });
  return res.statements || [];
}

// --- 決算発表日一覧 ---
async function fetchAnnouncement(token) {
  const url = `${BASE}/fins/announcement`;
  const res = await get(url, { Authorization: `Bearer ${token}` });
  return res.announcement || [];
}

// --- メイン ---
async function main() {
  const env = loadEnv();
  const refreshToken = env.JQUANTS_REFRESH_TOKEN || process.env.JQUANTS_REFRESH_TOKEN;

  if (!refreshToken) {
    console.log('⚠️  JQUANTS_REFRESH_TOKEN が未設定です');
    console.log('');
    console.log('セットアップ手順:');
    console.log('  1. https://application.jpx-jquants.com/ でアカウント登録（無料）');
    console.log('  2. ログイン後、リフレッシュトークンを取得');
    console.log('  3. プロジェクトルートに .env を作成:');
    console.log('     JQUANTS_REFRESH_TOKEN=あなたのトークン');
    console.log('');
    console.log('設定後に再実行してください: node scripts/api/jquants.js');
    process.exit(1);
  }

  console.log('=== J-Quants API データ取得 ===');

  // 1. IDトークン取得
  console.log('1. IDトークン取得中...');
  const token = await getIdToken(refreshToken);
  console.log('   ✅ トークン取得成功');

  // 2. 上場企業一覧
  console.log('2. 上場企業一覧取得中...');
  const listed = await fetchListedInfo(token);
  console.log(`   ✅ ${listed.length}社取得`);

  // jp_listed.json に保存
  const listedOut = {
    更新日時: new Date().toISOString(),
    ソース: 'J-Quants API (JPX公式)',
    ソースURL: 'https://api.jquants.com/',
    総数: listed.length,
    企業一覧: listed.map(c => ({
      コード: c.Code,
      企業名: c.CompanyName,
      企業名英語: c.CompanyNameEnglish || '',
      市場: c.MarketCode === '0111' ? 'プライム' : c.MarketCode === '0112' ? 'スタンダード' : c.MarketCode === '0113' ? 'グロース' : c.MarketCode,
      業種33: c.Sector33CodeName || '',
      業種17: c.Sector17CodeName || '',
      規模: c.ScaleCategory || '',
      四季報: `https://shikiho.toyokeizai.net/stocks/${c.Code?.slice(0,4)}`,
      EDINET: 'https://disclosure2.edinet-fsa.go.jp/',
    }))
  };
  const listedPath = path.join(ROOT, 'docs/data/jp_listed.json');
  fs.writeFileSync(listedPath, JSON.stringify(listedOut, null, 2), 'utf-8');
  console.log(`   → ${listedPath}`);

  // 3. 決算発表スケジュール
  console.log('3. 決算発表スケジュール取得中...');
  const announcements = await fetchAnnouncement(token);
  console.log(`   ✅ ${announcements.length}件取得`);

  // 4. 主要企業の財務データ取得（上位50社）
  console.log('4. 主要企業の財務データ取得中...');
  const majorCodes = [
    '72030','68610','67580','69020','80350','69200','69810','80580',
    '83060','98840','94320','94330','99830','45020','45680','65010',
    '65940','69540','70110','77410','89010','43070','60980','25020',
  ];
  const earningsList = [];
  for (const code of majorCodes) {
    try {
      const stmts = await fetchStatements(token, code);
      if (stmts.length > 0) {
        const latest = stmts[stmts.length - 1];
        const company = listed.find(c => c.Code === code);
        earningsList.push({
          企業名: company?.CompanyName || code,
          ティッカー: code.slice(0, 4),
          市場: company?.MarketCode === '0111' ? 'プライム' : 'その他',
          セクター: company?.Sector33CodeName || '',
          決算期: latest.TypeOfCurrentPeriod || '',
          発表日: latest.DisclosedDate || '',
          通貨: 'JPY',
          売上高: { 値: Number(latest.NetSales) || 0, 単位: '百万', 前年比: '' },
          営業利益: { 値: Number(latest.OperatingProfit) || 0, 単位: '百万', 前年比: '' },
          純利益: { 値: Number(latest.Profit) || 0, 単位: '百万', 前年比: '' },
          EPS: { 値: Number(latest.EarningsPerShare) || 0, 予想: 0, サプライズ: '' },
          ガイダンス: latest.ForecastNetSales ? `通期売上予想: ${Number(latest.ForecastNetSales).toLocaleString()}百万円` : '',
          注目点: '',
          リンク: {
            IR: '',
            EDINET: 'https://disclosure2.edinet-fsa.go.jp/',
            四季報: `https://shikiho.toyokeizai.net/stocks/${code.slice(0,4)}`,
            決算PDF: '',
          },
          ソース: 'J-Quants API',
          取得日: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (e) {
      // skip on error
    }
  }

  // earnings.json 更新
  const earningsPath = path.join(ROOT, 'docs/data/earnings.json');
  const earningsData = {
    更新日時: new Date().toISOString(),
    ソース: 'J-Quants API (JPX公式)',
    ソースURL: 'https://api.jquants.com/',
    決算スケジュール: announcements.slice(0, 30).map(a => ({
      日付: a.Date || '',
      企業: a.CompanyName || '',
      ティッカー: (a.Code || '').slice(0, 4),
      市場: '東証',
    })),
    決算一覧: earningsList,
  };
  fs.writeFileSync(earningsPath, JSON.stringify(earningsData, null, 2), 'utf-8');
  console.log(`   → ${earningsPath} (${earningsList.length}社)`);

  console.log('');
  console.log('=== 完了 ===');
}

main().catch(e => { console.error('エラー:', e.message); process.exit(1); });
