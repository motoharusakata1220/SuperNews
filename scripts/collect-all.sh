#!/bin/bash
# collect-all.sh — 全カテゴリの情報を収集し、ダッシュボード用JSONを生成
# 毎日 JST 0:00 に実行される想定
set -euo pipefail

ROOT="/workspaces/SuperNews"
DASH_DATA="$ROOT/output/動画/data"
TIMESTAMP=$(TZ=Asia/Tokyo date '+%Y-%m-%dT%H:%M:%S+09:00')
TODAY=$(TZ=Asia/Tokyo date '+%Y-%m-%d')

echo "=== SuperNews 全カテゴリ収集開始 ($TIMESTAMP) ==="
mkdir -p "$DASH_DATA"

# --- 1. 世界情勢 ---
echo "[1/6] 世界情勢を収集中..."
if [ -d "$ROOT/世界情勢" ] && [ -f "$ROOT/世界情勢/package.json" ]; then
  cd "$ROOT/世界情勢"
  npm run collect 2>/dev/null || node src/index.ts 2>/dev/null || echo "  → 世界情勢: collectコマンド失敗（既存データを使用）"
fi
# 既存outputを統合
node -e "
const fs=require('fs'),p=require('path');
const dir='$ROOT/世界情勢/output';
if(!fs.existsSync(dir)){process.exit(0)}
const all=[];
fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
  try{const d=JSON.parse(fs.readFileSync(p.join(dir,f),'utf8'));
  if(d.articles)all.push(...d.articles.map(a=>({...a,category:d.category||f.replace('.json','')})))}catch{}
});
all.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
fs.writeFileSync('$DASH_DATA/world-news.json',JSON.stringify({generatedAt:'$TIMESTAMP',count:all.length,articles:all},null,2));
console.log('  → 世界情勢: '+all.length+'件');
" 2>/dev/null || echo "  → 世界情勢: JSON統合スキップ"

# --- 2. 経済指標 ---
echo "[2/6] 経済指標を収集中..."
if [ -d "$ROOT/経済指標" ] && [ -f "$ROOT/経済指標/package.json" ]; then
  cd "$ROOT/経済指標"
  npm run collect 2>/dev/null || echo "  → 経済指標: collectコマンド失敗（既存データを使用）"
fi
node -e "
const fs=require('fs'),p=require('path');
const dir='$ROOT/経済指標/output';
if(!fs.existsSync(dir)){process.exit(0)}
const all={};
fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
  try{const d=JSON.parse(fs.readFileSync(p.join(dir,f),'utf8'));
  const key=f.replace('.json','');all[key]=d}catch{}
});
all.generatedAt='$TIMESTAMP';
fs.writeFileSync('$DASH_DATA/economy.json',JSON.stringify(all,null,2));
console.log('  → 経済指標: '+Object.keys(all).length+'ファイル統合');
" 2>/dev/null || echo "  → 経済指標: JSON統合スキップ"

# --- 3. 投資 ---
echo "[3/6] 投資情報を収集中..."
node -e "
const fs=require('fs'),p=require('path');
const base='$ROOT/投資';
const out={generatedAt:'$TIMESTAMP',channels:[],videos:[],transcriptCount:0};
try{out.channels=JSON.parse(fs.readFileSync(p.join(base,'channels.json'),'utf8')).channels||[]}catch{}
try{out.videos=JSON.parse(fs.readFileSync(p.join(base,'summaries.json'),'utf8'))||[]}catch{}
const tDir=p.join(base,'transcripts');
if(fs.existsSync(tDir)){out.transcriptCount=fs.readdirSync(tDir).filter(f=>f.endsWith('.txt')).length}
fs.writeFileSync('$DASH_DATA/invest.json',JSON.stringify(out,null,2));
console.log('  → 投資: チャンネル'+out.channels.length+'件, 動画'+out.videos.length+'件');
" 2>/dev/null || echo "  → 投資: JSON統合スキップ"

# --- 4. 企業情報 ---
echo "[4/6] 企業情報を収集中..."
if [ -d "$ROOT/企業情報" ] && [ -f "$ROOT/企業情報/package.json" ]; then
  cd "$ROOT/企業情報"
  npm run collect 2>/dev/null || echo "  → 企業情報: collectコマンド失敗（既存データを使用）"
fi
# 企業情報MDを読み込んでJSON化
node -e "
const fs=require('fs'),p=require('path');
const dir='$ROOT/output/企業情報';
const out={generatedAt:'$TIMESTAMP',reports:[]};
if(fs.existsSync(dir)){
  fs.readdirSync(dir).filter(f=>f.endsWith('.md')).forEach(f=>{
    const content=fs.readFileSync(p.join(dir,f),'utf8');
    out.reports.push({filename:f,content:content.slice(0,5000)});
  });
}
fs.writeFileSync('$DASH_DATA/company.json',JSON.stringify(out,null,2));
console.log('  → 企業情報: レポート'+out.reports.length+'件');
" 2>/dev/null || echo "  → 企業情報: JSON統合スキップ"

# --- 5. 背景知識 ---
echo "[5/6] 背景知識を収集中..."
node -e "
const fs=require('fs');
const src='$ROOT/背景知識/output/背景知識.json';
const dst='$DASH_DATA/knowledge.json';
if(fs.existsSync(src)){fs.copyFileSync(src,dst);console.log('  → 背景知識: コピー完了')}
else{console.log('  → 背景知識: ファイルなし')}
" 2>/dev/null || echo "  → 背景知識: スキップ"

# --- 6. 関係性 ---
echo "[6/6] 関係性を収集中..."
node -e "
const fs=require('fs');
const src='$ROOT/output/関係性.json';
const dst='$DASH_DATA/relations.json';
if(fs.existsSync(src)){fs.copyFileSync(src,dst);console.log('  → 関係性: コピー完了')}
else{console.log('  → 関係性: ファイルなし')}
" 2>/dev/null || echo "  → 関係性: スキップ"

echo ""
echo "=== 収集完了 ($TIMESTAMP) ==="
echo "出力先: $DASH_DATA/"
ls -la "$DASH_DATA/"
