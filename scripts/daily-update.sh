#!/bin/bash
# daily-update.sh — 毎日JST 0:00に実行: 情報収集 → ダッシュボード再生成 → git commit
set -euo pipefail

ROOT="/workspaces/SuperNews"
TIMESTAMP=$(TZ=Asia/Tokyo date '+%Y-%m-%d')

echo "=== SuperNews 日次更新 ($TIMESTAMP) ==="

# Step 1: 全カテゴリ情報収集
echo "[Step 1] 情報収集..."
bash "$ROOT/scripts/collect-all.sh"

# Step 2: 各カテゴリの収集スクリプトを実行（存在する場合）
echo "[Step 2] カテゴリ別収集..."
for dir in "$ROOT"/世界情勢 "$ROOT"/経済指標 "$ROOT"/企業情報 "$ROOT"/投資 "$ROOT"/背景知識; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "  → $(basename "$dir") を処理中..."
    cd "$dir"
    npm run collect 2>/dev/null || true
  fi
done

# Step 3: 関係性分析を再実行
echo "[Step 3] 関係性分析..."
cd "$ROOT/src/relations"
npm run analyze 2>/dev/null || echo "  → 関係性分析スキップ"

# Step 4: ダッシュボード用データ再収集
echo "[Step 4] ダッシュボードデータ更新..."
bash "$ROOT/scripts/collect-all.sh"

# Step 5: ダッシュボードHTML再生成
echo "[Step 5] ダッシュボード生成..."
node "$ROOT/scripts/generate-dashboard.js"

# Step 6: ローカルコミット
echo "[Step 5] ローカルコミット..."
cd "$ROOT"
git add output/ 世界情勢/output/ 経済指標/output/ 背景知識/output/ 投資/summaries.json 投資/channels.json 2>/dev/null || true
git add output/企業情報/ output/関係性.json output/動画/ 2>/dev/null || true

# 変更がある場合のみコミット
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "$(cat <<EOF
docs: 日次データ更新 ($TIMESTAMP)

- 世界情勢ニュース更新
- 経済指標データ更新
- 企業情報・書類更新
- 投資チャンネル・動画更新
- 関係性分析更新
- ダッシュボードデータ更新

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
  echo "  → コミット完了"
else
  echo "  → 変更なし、コミットスキップ"
fi

echo ""
echo "=== 日次更新完了 ==="
