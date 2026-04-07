#!/bin/bash
# delegate.sh - 子フォルダで新しいターミナルを開き、Claude Codeに指示を渡す
#
# 使い方:
#   ./delegate.sh <子フォルダ名> "<指示内容>"
#
# 例:
#   ./delegate.sh frontend "ログイン画面を作成して"
#   ./delegate.sh backend "APIエンドポイントを追加して"

CHILD_DIR="$1"
PROMPT="$2"

if [[ -z "$CHILD_DIR" || -z "$PROMPT" ]]; then
    echo "使い方: ./delegate.sh <子フォルダ名> \"<指示内容>\""
    exit 1
fi

FULL_PATH="/workspaces/SuperNews/$CHILD_DIR"

# 子フォルダが存在しない場合は作成
if [[ ! -d "$FULL_PATH" ]]; then
    echo "子フォルダ '$CHILD_DIR' が存在しないため作成します..."
    mkdir -p "$FULL_PATH"
fi

echo "[$CHILD_DIR] に Claude Code を起動して指示を送ります..."

# 新しいターミナルセッションで子フォルダに移動し、Claude Codeを起動して指示を渡す
# tmux を使って新しいウインドウで実行
if command -v tmux &> /dev/null; then
    if [[ -z "$TMUX" ]]; then
        # tmuxセッションが無い場合、新規セッションを作成
        tmux new-session -d -s "supernews" -c "$FULL_PATH" "npx @anthropic-ai/claude-code --print \"$PROMPT\"" 2>/dev/null
        tmux attach -t "supernews"
    else
        # 既にtmux内にいる場合、新しいウインドウを作成
        tmux new-window -n "$CHILD_DIR" -c "$FULL_PATH" "npx @anthropic-ai/claude-code --print \"$PROMPT\""
    fi
else
    # tmuxが無い場合はバックグラウンドで実行
    echo "tmux が見つかりません。バックグラウンドで実行します..."
    cd "$FULL_PATH" && npx @anthropic-ai/claude-code --print "$PROMPT" &
    echo "PID: $!"
fi
