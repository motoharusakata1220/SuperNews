#!/bin/bash
# 知識エントリ追加スクリプト（Maxプランで無料）
# 使い方: bash scripts/add-knowledge.sh [カテゴリー名]
# 初回のみ: claude auth login  ← OAuth認証（Maxプラン）

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
KNOWLEDGE="$REPO/docs/data/knowledge.json"

# 次回カテゴリー取得
if [ -n "$1" ]; then
  TARGET_CAT="$1"
else
  TARGET_CAT=$(python3 -c "
import json
with open('$KNOWLEDGE') as f:
    d = json.load(f)
print(d.get('次回カテゴリー', '半導体・電子部品'))
")
fi

CURRENT_COUNT=$(python3 -c "
import json
with open('$KNOWLEDGE') as f:
    d = json.load(f)
print(len(d.get('エントリ', [])))
")

echo "対象カテゴリー: $TARGET_CAT"
echo "現在エントリ数: $CURRENT_COUNT"
echo ""

PROMPT="docs/data/knowledge.json を読み込み、「${TARGET_CAT}」カテゴリーのエントリを追加してください。

## 追加内容
- 要素レベル: 10件（カテゴリーの主要構成要素）
- 中要素レベル: 各要素につき2〜3件（主要国・制度・技術）
- 事象レベル: 合計10件（重要な出来事・政策・トレンド）

## エントリフォーマット
{
  \"id\": \"k_{カテゴリー略号}_{要素略}\",
  \"level\": \"要素 or 中要素 or 事象\",
  \"カテゴリー\": \"${TARGET_CAT}\",
  \"parent_id\": null（要素）またはprentのid,
  \"タイトル\": \"...\",
  \"概要\": \"150-300文字の専門的概要（数値・企業名含む）\",
  \"歴史\": {\"年代\": \"出来事\"},
  \"現状\": \"現在の状況（数値・シェア含む）\",
  \"構造要因\": [\"要因1\", \"要因2\", \"要因3\"],
  \"課題・リスク\": [\"課題1\", \"課題2\"],
  \"予測\": {
    \"公的機関\": [{\"出典\": \"機関名(年)\", \"内容\": \"予測\"}],
    \"推論\": {\"根拠\": \"...\", \"楽観\": \"...\", \"悲観\": \"...\"}
  },
  \"関連\": []
}

## 更新後の処理
1. エントリ数・更新日時を更新
2. 次回カテゴリーを次のカテゴリーに変更（順序: 半導体・電子部品→AI・テクノロジー→自動車・モビリティ→エネルギー→製薬・ヘルスケア→農業・食料→金融市場→物流・サプライチェーン→マクロ経済→地政学・安全保障→外交・国際関係→規制・法制度→国内政治・社会→企業動向→最初に戻る）
3. git add docs/data/knowledge.json && git commit -m 'feat: knowledge.json ${TARGET_CAT}エントリ追加'
4. git push は絶対に行わない
"

cd "$REPO"
echo "=== Claude Code 実行中... ==="
claude --dangerously-skip-permissions -p "$PROMPT"

echo ""
echo "=== 完了 ==="
python3 -c "
import json
with open('$KNOWLEDGE') as f:
    d = json.load(f)
print(f'エントリ数: {len(d[\"エントリ\"])}')
print(f'次回カテゴリー: {d.get(\"次回カテゴリー\", \"未設定\")}')
"
