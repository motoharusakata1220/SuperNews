#!/bin/bash
# boot.sh - SuperNews 全カテゴリ一括起動（tmux + Claude Code）
#
# 使い方:
#   ./scripts/boot.sh                    # 全カテゴリ起動
#   ./scripts/boot.sh investment science # 指定カテゴリのみ起動

ROOT_DIR="/workspaces/SuperNews"
SESSION_NAME="supernews"

# カテゴリフォルダを取得（src/, scripts/, tests/, input/, output/, node_modules を除外）
get_categories() {
    if [[ $# -gt 0 ]]; then
        echo "$@"
    else
        find "$ROOT_DIR" -maxdepth 1 -mindepth 1 -type d \
            ! -name '.*' \
            ! -name 'src' \
            ! -name 'scripts' \
            ! -name 'tests' \
            ! -name 'input' \
            ! -name 'output' \
            ! -name 'node_modules' \
            -printf '%f\n' | sort
    fi
}

# tmuxセッション作成（既に存在すれば再利用）
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux new-session -d -s "$SESSION_NAME" -n "hub" -c "$ROOT_DIR"
    echo "[hub] tmuxセッション '$SESSION_NAME' を作成しました"
else
    echo "[hub] 既存のtmuxセッション '$SESSION_NAME' を使用します"
fi

# 各カテゴリにウィンドウを作成してClaude Codeを起動
CATEGORIES=$(get_categories "$@")
for CATEGORY in $CATEGORIES; do
    CATEGORY_PATH="$ROOT_DIR/$CATEGORY"
    if [[ ! -d "$CATEGORY_PATH" ]]; then
        echo "[$CATEGORY] フォルダが存在しません。スキップします。"
        continue
    fi

    # 既にウィンドウが存在する場合はスキップ
    if tmux list-windows -t "$SESSION_NAME" -F "#{window_name}" 2>/dev/null | grep -q "^${CATEGORY}$"; then
        echo "[$CATEGORY] 既にウィンドウが存在します。スキップします。"
        continue
    fi

    tmux new-window -t "$SESSION_NAME" -n "$CATEGORY" -c "$CATEGORY_PATH"
    tmux send-keys -t "$SESSION_NAME:$CATEGORY" "claude --dangerously-skip-permissions" Enter
    echo "[$CATEGORY] ウィンドウ作成 + Claude Code 起動"
done

echo ""
echo "=== SuperNews 起動完了 ==="
echo "接続: tmux attach -t $SESSION_NAME"
echo "一覧: tmux list-windows -t $SESSION_NAME"

# tmuxに未接続ならアタッチ
if [[ -z "$TMUX" ]]; then
    tmux attach -t "$SESSION_NAME"
fi
