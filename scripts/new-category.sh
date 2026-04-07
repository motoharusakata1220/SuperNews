#!/bin/bash
# new-category.sh - 新規カテゴリフォルダを作成
#
# 使い方:
#   ./scripts/new-category.sh 科学 "科学系ニッチ情報の収集"
#   ./scripts/new-category.sh 技術

ROOT_DIR="/workspaces/SuperNews"
CATEGORY="$1"
DESCRIPTION="${2:-$CATEGORY カテゴリの情報収集}"

if [[ -z "$CATEGORY" ]]; then
    echo "使い方: ./scripts/new-category.sh <カテゴリ名> [説明]"
    exit 1
fi

CATEGORY_PATH="$ROOT_DIR/$CATEGORY"

if [[ -d "$CATEGORY_PATH" ]]; then
    echo "エラー: '$CATEGORY' は既に存在します。"
    exit 1
fi

# フォルダ構造を作成
mkdir -p "$CATEGORY_PATH"/{input,output}

# CLAUDE.md を作成
cat > "$CATEGORY_PATH/CLAUDE.md" << EOF
# SuperNews — $CATEGORY カテゴリ

## 概要
$DESCRIPTION

## ルール
- 親フォルダの CLAUDE.md ルールをすべて継承する
- 収集した情報は \`output/\` に保存する
- 入力資料は \`input/\` に置く
- 日本語で作業すること
EOF

# README.md を作成
cat > "$CATEGORY_PATH/README.md" << EOF
# $CATEGORY

$DESCRIPTION
EOF

echo "=== カテゴリ '$CATEGORY' を作成しました ==="
echo "$CATEGORY_PATH/"
echo "├── CLAUDE.md"
echo "├── README.md"
echo "├── input/"
echo "└── output/"
echo ""
echo "tmuxウィンドウに追加するには:"
echo "  tmux new-window -t supernews -n '$CATEGORY' -c '$CATEGORY_PATH'"
