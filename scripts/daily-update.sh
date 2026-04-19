#!/bin/bash
# daily-update.sh — 日次データ更新バッチ
# 実行内容:
#   1. 各国発表 RSS 収集 → docs/data/country_announcements/
#   2. EDINET 決算スケジュール更新（APIキー不要モード）
#   3. 全カテゴリ出力 → docs/data/all.json に集約
#   4. ニュースにサブカテゴリータグを付与
#   5. docs/data/ の変更を git commit
#
# Remote Trigger での使用:
#   bash scripts/daily-update.sh
# ローカル実行:
#   bash scripts/daily-update.sh --no-commit

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TIMESTAMP=$(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M JST')
DATE=$(TZ=Asia/Tokyo date '+%Y-%m-%d')
NO_COMMIT="${1:-}"

echo "=== SuperNews 日次更新 ($TIMESTAMP) ==="
echo "ROOT: $ROOT"

cd "$ROOT"

# Step 1: 各国発表 RSS 収集
echo ""
echo "[1/4] 各国発表 RSS 収集..."
python3 "$ROOT/scripts/collect_country_announcements.py" --all 2>&1 | tail -5 || echo "  → RSS収集でエラー発生（スキップ）"

# Step 2: EDINET 決算スケジュール更新（スケジュールのみ・APIキー不要）
echo ""
echo "[2/4] EDINET 決算スケジュール更新..."
if [ -n "${EDINET_API_KEY:-}" ]; then
  python3 "$ROOT/scripts/fetch_edinet_financials.py" --today 2>&1 | tail -5 || echo "  → EDINETエラー（スキップ）"
else
  echo "  → EDINET_API_KEY 未設定のためスキップ"
fi

# Step 3: 全カテゴリ集約 → docs/data/all.json
echo ""
echo "[3/4] データ集約 (aggregate.sh)..."
bash "$ROOT/scripts/aggregate.sh" 2>&1 | tail -5

# Step 4: サブカテゴリータグ付与
echo ""
echo "[4/4] サブカテゴリータグ付与..."
python3 "$ROOT/scripts/tag_news_subcategory.py" 2>&1 | tail -3

# Step 5: git commit（--no-commit フラグがなければ実行）
if [ "$NO_COMMIT" = "--no-commit" ]; then
  echo ""
  echo "=== --no-commit モード: コミットをスキップ ==="
  exit 0
fi

echo ""
echo "[5/5] git commit..."
git add \
  docs/data/all.json \
  docs/data/relations.json \
  docs/data/country_announcements/ \
  docs/data/financials/ \
  2>/dev/null || true

if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "$(cat <<EOF
docs: 日次データ更新 ($DATE)

- 各国発表 RSS 収集
- データ集約 (all.json)
- サブカテゴリータグ付与

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
  echo "  → コミット完了"
  echo ""
  echo "  GitHub Pages に反映するには: git push origin main"
else
  echo "  → 変更なし、コミットスキップ"
fi

echo ""
echo "=== 日次更新完了 ($TIMESTAMP) ==="
