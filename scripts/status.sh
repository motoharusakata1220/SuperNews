#!/bin/bash
# status.sh - SuperNews 全カテゴリの状態確認
#
# 使い方:
#   ./scripts/status.sh

SESSION_NAME="supernews"
ROOT_DIR="/workspaces/SuperNews"

echo "=== SuperNews ステータス ==="
echo ""

# tmuxセッション確認
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "[tmux] セッション '$SESSION_NAME' 稼働中"
    echo ""
    echo "ウィンドウ一覧:"
    tmux list-windows -t "$SESSION_NAME" -F "  #{window_index} | #{window_name} | #{pane_current_command}" 2>/dev/null
else
    echo "[tmux] セッション '$SESSION_NAME' は未起動"
fi

echo ""
echo "カテゴリフォルダ一覧:"
find "$ROOT_DIR" -maxdepth 1 -mindepth 1 -type d \
    ! -name '.*' \
    ! -name 'src' \
    ! -name 'scripts' \
    ! -name 'tests' \
    ! -name 'input' \
    ! -name 'output' \
    ! -name 'node_modules' \
    -printf "  %f\n" 2>/dev/null | sort

echo ""
echo "=== 完了 ==="
