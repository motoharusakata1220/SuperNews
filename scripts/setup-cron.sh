#!/bin/bash
# cron自動実行セットアップ（サーバー上で一度だけ実行）
# 前提: claude auth login 済み、git設定済み

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$REPO/logs/knowledge-update.log"

mkdir -p "$REPO/logs"

# crontab に追加（毎日 JST 3:00 = UTC 18:00）
CRON_LINE="0 18 * * * cd $REPO && bash scripts/add-knowledge.sh >> $LOG 2>&1"

# 既存のcronに追加（重複チェック）
(crontab -l 2>/dev/null | grep -v "add-knowledge.sh"; echo "$CRON_LINE") | crontab -

echo "cron設定完了:"
crontab -l | grep "add-knowledge"
echo ""
echo "ログ: $LOG"
echo "手動実行: bash $REPO/scripts/add-knowledge.sh"
