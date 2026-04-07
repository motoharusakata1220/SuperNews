#!/bin/bash
# broadcast.sh - 全カテゴリウィンドウへ一括コマンド送信
#
# 使い方:
#   ./scripts/broadcast.sh "npm test を実行してください"
#   ./scripts/broadcast.sh --exclude hub "全カテゴリのテストを実行して"

SESSION_NAME="supernews"
EXCLUDE="hub"
MESSAGE=""

# 引数パース
while [[ $# -gt 0 ]]; do
    case "$1" in
        --exclude)
            EXCLUDE="$EXCLUDE|$2"
            shift 2
            ;;
        *)
            MESSAGE="$1"
            shift
            ;;
    esac
done

if [[ -z "$MESSAGE" ]]; then
    echo "使い方: ./scripts/broadcast.sh \"コマンドまたは指示\""
    exit 1
fi

if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "エラー: tmuxセッション '$SESSION_NAME' が見つかりません。先に boot.sh を実行してください。"
    exit 1
fi

echo "=== 一括送信: $MESSAGE ==="

tmux list-windows -t "$SESSION_NAME" -F "#{window_name}" | while read -r WINDOW; do
    if echo "$WINDOW" | grep -qE "^($EXCLUDE)$"; then
        echo "[$WINDOW] スキップ"
        continue
    fi
    tmux send-keys -t "$SESSION_NAME:$WINDOW" "$MESSAGE" Enter
    echo "[$WINDOW] 送信完了"
done

echo "=== 送信完了 ==="
