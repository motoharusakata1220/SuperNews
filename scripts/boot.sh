#!/bin/bash
# boot.sh - SuperNews 全カテゴリ一括起動（tmux + Claude Code）
#
# 使い方:
#   ./scripts/boot.sh              # 全カテゴリ起動
#   ./scripts/boot.sh エネルギー   # 指定カテゴリのみ起動

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SESSION_NAME="supernews"

# カテゴリフォルダ（固定順）
ALL_CATEGORIES=(
  "背景知識"
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

get_categories() {
  if [[ $# -gt 0 ]]; then
    echo "$@"
  else
    printf '%s\n' "${ALL_CATEGORIES[@]}"
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
while IFS= read -r CATEGORY; do
  [[ -z "$CATEGORY" ]] && continue
  CATEGORY_PATH="$ROOT_DIR/$CATEGORY"

  if [[ ! -d "$CATEGORY_PATH" ]]; then
    echo "[$CATEGORY] フォルダが存在しません。スキップします。"
    continue
  fi

  if tmux list-windows -t "$SESSION_NAME" -F "#{window_name}" 2>/dev/null | grep -qF "$CATEGORY"; then
    echo "[$CATEGORY] 既にウィンドウが存在します。スキップします。"
    continue
  fi

  tmux new-window -t "$SESSION_NAME" -n "$CATEGORY" -c "$CATEGORY_PATH"
  tmux send-keys -t "$SESSION_NAME:$CATEGORY" "claude --dangerously-skip-permissions" Enter
  echo "[$CATEGORY] ウィンドウ作成 + Claude Code 起動"
done < <(get_categories "$@")

echo ""
echo "=== SuperNews 起動完了 ==="
echo "接続: tmux attach -t $SESSION_NAME"
echo "一覧: tmux list-windows -t $SESSION_NAME"

if [[ -z "$TMUX" ]]; then
  tmux attach -t "$SESSION_NAME"
fi
