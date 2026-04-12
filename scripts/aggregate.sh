#!/bin/bash
# aggregate.sh - 全カテゴリの出力JSONを集約して docs/data/all.json を生成する
#
# 使い方:
#   ./scripts/aggregate.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_FILE="$ROOT_DIR/docs/data/all.json"
mkdir -p "$ROOT_DIR/docs/data"

CATEGORIES=(
  "地政学・安全保障"
  "外交・国際関係"
  "マクロ経済"
  "金融市場"
  "エネルギー"
  "半導体・電子部品"
  "自動車・モビリティ"
  "AI・テクノロジー"
  "製薬・ヘルスケア"
  "農業・食料"
  "物流・サプライチェーン"
  "規制・法制度"
  "国内政治・社会"
  "企業動向"
)

echo "=== SuperNews 集約開始 ==="

# node で集約
export SUPERNEWS_ROOT="$ROOT_DIR"
node - << 'NODESCRIPT'
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.env.SUPERNEWS_ROOT;
const CATEGORIES = [
  '地政学・安全保障', '外交・国際関係', 'マクロ経済', '金融市場',
  'エネルギー', '半導体・電子部品', '自動車・モビリティ', 'AI・テクノロジー',
  '製薬・ヘルスケア', '農業・食料', '物流・サプライチェーン',
  '規制・法制度', '国内政治・社会', '企業動向'
];

const all = {
  更新日時: new Date().toISOString(),
  カテゴリ一覧: CATEGORIES,
  情報: []
};

for (const cat of CATEGORIES) {
  const outDir = path.join(ROOT_DIR, cat, '出力');
  if (!fs.existsSync(outDir)) continue;

  const files = fs.readdirSync(outDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // 新しい日付順

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(outDir, file), 'utf-8'));
      if (data.情報 && Array.isArray(data.情報)) {
        const itemsWithCat = data.情報.map(item => ({ カテゴリ: cat, ...item }));
        all.情報.push(...itemsWithCat);
      }
    } catch (e) {
      console.error(`読み込みエラー: ${cat}/${file}`);
    }
  }
}

const outputPath = path.join(ROOT_DIR, 'docs/data/all.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(all, null, 2), 'utf-8');
console.log(`✅ 集約完了: ${all.情報.length}件 → docs/data/all.json`);

// --- relations.json 生成 ---
const nodes = new Map();
const edgeMap = new Map();
for (const item of all.情報) {
  const cat = item.カテゴリ;
  if (!nodes.has(cat)) nodes.set(cat, { id: cat, count: 0 });
  nodes.get(cat).count++;
  for (const link of (item.紐付き || [])) {
    const target = link.カテゴリ;
    if (!nodes.has(target)) nodes.set(target, { id: target, count: 0 });
    const key = cat + '→' + target;
    if (!edgeMap.has(key)) edgeMap.set(key, { source: cat, target, count: 0, details: [] });
    const entry = edgeMap.get(key);
    entry.count++;
    entry.details.push({ label: link.サブ || '', content: link.内容 || '' });
  }
}
const relPath = path.join(ROOT_DIR, 'docs/data/relations.json');
fs.writeFileSync(relPath, JSON.stringify({
  更新日時: all.更新日時,
  nodes: [...nodes.values()],
  edges: [...edgeMap.values()]
}, null, 2), 'utf-8');
console.log(`✅ 紐付き: nodes=${nodes.size} edges=${edgeMap.size} → docs/data/relations.json`);
NODESCRIPT

echo ""
echo "=== 集約完了 ==="
echo "次のステップ: ./scripts/deploy.sh を実行してGitHub Pagesに反映"
