#!/bin/bash
# deploy.sh - docs/ を git commit して GitHub Pages に反映する
#
# 使い方:
#   ./scripts/deploy.sh
#
# 注意: git push は CLAUDE.md のルール上、坂田さんの明示的な許可が必要です。
#       このスクリプトは commit までを自動化し、push は手動で行ってください。

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== SuperNews デプロイ準備 ==="

# 1. 集約実行
echo "[1/3] データ集約中..."
bash "$ROOT_DIR/scripts/aggregate.sh"

# 2. docs/ の変更を確認
echo ""
echo "[2/3] 変更ファイルを確認中..."
git status docs/

# 3. コミット
DATE=$(date '+%Y-%m-%d %H:%M')
echo ""
echo "[3/3] コミット中..."
git add docs/data/all.json docs/index.html docs/assets/ 2>/dev/null || true
git commit -m "feat: ダッシュボード更新 ${DATE}" 2>/dev/null || echo "変更なし（コミットスキップ）"

echo ""
echo "=== 準備完了 ==="
echo "GitHub Pages に反映するには手動で以下を実行してください:"
echo "  git push origin main"
