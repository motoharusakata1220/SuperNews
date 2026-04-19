#!/usr/bin/env python3
"""
EDINET API から上場企業の決算書（B/S・P/L・CF）を取得するスクリプト。
1日1社〜数社ずつ取得し、docs/data/financials/ に保存する。

使い方:
  python3 scripts/fetch_edinet_financials.py --date 2024-03-31
  python3 scripts/fetch_edinet_financials.py --code 7203   # トヨタ
  python3 scripts/fetch_edinet_financials.py --today        # 今日提出分を一括
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta
from pathlib import Path

EDINET_BASE = "https://disclosure.edinet-fsa.go.jp/api/v2"
OUT_DIR = Path(__file__).parent.parent / "docs" / "data" / "financials"
COMPANIES_JSON = Path(__file__).parent.parent / "docs" / "data" / "companies.json"
SCHEDULES_JSON = OUT_DIR / "schedules.json"

# EDINET API キー（無料・要登録）
# 取得方法: https://api.edinet-fsa.go.jp/api/v2/
# 環境変数 EDINET_API_KEY に設定するか、下記に直接入力
EDINET_API_KEY = os.environ.get("EDINET_API_KEY", "")

# EDINET の書類種別コード
DOC_TYPE_ANNUAL = "120"      # 有価証券報告書
DOC_TYPE_QUARTERLY = "140"   # 四半期報告書
DOC_TYPE_SEMIANNUAL = "160"  # 半期報告書


def get(url: str) -> dict:
    """EDINET API を GET してJSONを返す。"""
    if not EDINET_API_KEY:
        print("  ERROR: EDINET_API_KEY が設定されていません。", file=sys.stderr)
        print("  取得方法: https://disclosure2dl.edinet-fsa.go.jp/searchdocument/html/JMain.html", file=sys.stderr)
        print("  → 右上メニュー「API」→「APIキーの取得」（無料）", file=sys.stderr)
        print("  → 取得後: export EDINET_API_KEY=your_key", file=sys.stderr)
        sys.exit(1)
    sep = "&" if "?" in url else "?"
    full_url = f"{url}{sep}Subscription-Key={EDINET_API_KEY}"
    try:
        req = urllib.request.Request(full_url, headers={"User-Agent": "SuperNews/1.0"})
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {url}", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return {}


def fetch_doc_list(target_date: str) -> list:
    """指定日に提出された書類一覧を取得する。"""
    url = f"{EDINET_BASE}/documents.json?date={target_date}&type=2"
    data = get(url)
    return data.get("results", [])


def fetch_xbrl_inline(doc_id: str) -> bytes:
    """XBRL インラインHTMLを取得する（type=4）。"""
    url = f"{EDINET_BASE}/documents/{doc_id}?type=4&Subscription-Key={EDINET_API_KEY}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SuperNews/1.0"})
        with urllib.request.urlopen(req, timeout=60) as res:
            return res.read()
    except Exception as e:
        print(f"  XBRL取得失敗 {doc_id}: {e}", file=sys.stderr)
        return b""


def parse_key_figures(raw_xbrl: bytes) -> dict:
    """
    XBRL から主要財務数値を簡易抽出する。
    完全なXBRLパーサではなく、よく使われるタグを正規表現で拾う。
    """
    import re
    text = raw_xbrl.decode("utf-8", errors="ignore")

    def extract(pattern: str) -> float | None:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            try:
                return float(m.group(1).replace(",", ""))
            except Exception:
                return None
        return None

    # 連結 B/S
    bs = {
        "総資産": extract(r'contextRef="CurrentYearInstant[^"]*"[^>]*name="[^"]*Assets[^"]*"[^>]*>([0-9,]+)<'),
        "純資産": extract(r'contextRef="CurrentYearInstant[^"]*"[^>]*name="[^"]*NetAssets[^"]*"[^>]*>([0-9,]+)<'),
        "流動資産": extract(r'name="[^"]*CurrentAssets[^"]*"[^>]*contextRef="CurrentYearInstant[^"]*"[^>]*>([0-9,]+)<'),
        "固定資産": extract(r'name="[^"]*NoncurrentAssets[^"]*"[^>]*contextRef="CurrentYearInstant[^"]*"[^>]*>([0-9,]+)<'),
        "流動負債": extract(r'name="[^"]*CurrentLiabilities[^"]*"[^>]*contextRef="CurrentYearInstant[^"]*"[^>]*>([0-9,]+)<'),
        "固定負債": extract(r'name="[^"]*NoncurrentLiabilities[^"]*"[^>]*contextRef="CurrentYearInstant[^"]*"[^>]*>([0-9,]+)<'),
    }
    # 連結 P/L
    pl = {
        "売上高": extract(r'name="[^"]*(?:NetSales|Revenue)[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>([0-9,]+)<'),
        "営業利益": extract(r'name="[^"]*OperatingIncome[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>([0-9,]+)<'),
        "経常利益": extract(r'name="[^"]*OrdinaryIncome[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>([0-9,]+)<'),
        "当期純利益": extract(r'name="[^"]*NetIncome[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>([0-9,]+)<'),
    }
    # 連結 CF
    cf = {
        "営業CF": extract(r'name="[^"]*NetCashProvidedByUsedInOperatingActivities[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>(-?[0-9,]+)<'),
        "投資CF": extract(r'name="[^"]*NetCashProvidedByUsedInInvestingActivities[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>(-?[0-9,]+)<'),
        "財務CF": extract(r'name="[^"]*NetCashProvidedByUsedInFinancingActivities[^"]*"[^>]*contextRef="CurrentYearDuration[^"]*"[^>]*>(-?[0-9,]+)<'),
        "現金等": extract(r'name="[^"]*CashAndCashEquivalents[^"]*"[^>]*contextRef="CurrentYearInstant[^"]*"[^>]*>([0-9,]+)<'),
    }
    return {"BS": bs, "PL": pl, "CF": cf}


def load_companies() -> dict:
    """companies.json を {証券コード: 社名} の辞書で返す。"""
    with open(COMPANIES_JSON, encoding="utf-8") as f:
        d = json.load(f)
    return {c["code"]: c["name"] for c in d.get("企業一覧", [])}


def save_financial(code: str, name: str, doc_id: str, period_end: str, doc_type: str, figures: dict):
    """財務データを docs/data/financials/{code}.json に保存（追記）。"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{code}.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            existing = json.load(f)
    else:
        existing = {"証券コード": code, "社名": name, "決算履歴": []}

    # 同じ決算期の重複を避ける
    existing["決算履歴"] = [h for h in existing["決算履歴"] if h.get("決算期末") != period_end]
    existing["決算履歴"].append({
        "決算期末": period_end,
        "書類種別": doc_type,
        "EDINET書類ID": doc_id,
        "取得日時": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        **figures,
    })
    existing["決算履歴"].sort(key=lambda h: h.get("決算期末", ""), reverse=True)
    existing["最終更新"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
    print(f"  保存: {path.name}")


def update_schedules(entries: list):
    """決算発表スケジュール（schedules.json）を更新する。"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if SCHEDULES_JSON.exists():
        with open(SCHEDULES_JSON, encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"更新日時": "", "スケジュール": []}

    existing_ids = {e["EDINET書類ID"] for e in data["スケジュール"]}
    for e in entries:
        if e["EDINET書類ID"] not in existing_ids:
            data["スケジュール"].append(e)
            existing_ids.add(e["EDINET書類ID"])

    data["スケジュール"].sort(key=lambda e: e.get("提出日", ""), reverse=True)
    data["更新日時"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(SCHEDULES_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"スケジュール更新: {len(data['スケジュール'])}件")


def process_date(target_date: str, companies: dict, fetch_xbrl: bool = True):
    """指定日の提出書類を処理する。"""
    print(f"\n=== {target_date} の提出書類を取得 ===")
    docs = fetch_doc_list(target_date)
    if not docs:
        print("  書類なし / APIエラー")
        return

    target_types = {DOC_TYPE_ANNUAL, DOC_TYPE_QUARTERLY, DOC_TYPE_SEMIANNUAL}
    schedule_entries = []
    processed = 0

    for doc in docs:
        doc_type_code = doc.get("docTypeCode", "")
        if doc_type_code not in target_types:
            continue

        edinet_code = doc.get("edinetCode", "")
        sec_code = doc.get("secCode", "")
        if sec_code:
            sec_code = sec_code.rstrip("0")  # 末尾の0を除去（5桁→4桁）

        filer = doc.get("filerName", "")
        doc_id = doc.get("docID", "")
        period_end = doc.get("periodEnd", "")
        submit_date = doc.get("submitDateTime", "")[:10]

        doc_type_name = {
            DOC_TYPE_ANNUAL: "有価証券報告書",
            DOC_TYPE_QUARTERLY: "四半期報告書",
            DOC_TYPE_SEMIANNUAL: "半期報告書",
        }.get(doc_type_code, doc_type_code)

        print(f"  {filer}（{sec_code}）: {doc_type_name} 期末={period_end}")

        schedule_entries.append({
            "EDINET書類ID": doc_id,
            "証券コード": sec_code,
            "EDINETコード": edinet_code,
            "社名": filer,
            "書類種別": doc_type_name,
            "決算期末": period_end,
            "提出日": submit_date,
        })

        if fetch_xbrl and sec_code and (sec_code in companies or True):
            name = companies.get(sec_code, filer)
            raw = fetch_xbrl_inline(doc_id)
            if raw:
                figures = parse_key_figures(raw)
                save_financial(sec_code, name, doc_id, period_end, doc_type_name, figures)
                processed += 1
                time.sleep(0.5)  # レート制限対策

    update_schedules(schedule_entries)
    print(f"\n処理完了: {processed}社の財務データを取得")


def process_code(code: str, companies: dict):
    """証券コードを指定して最新の有価証券報告書を取得する。"""
    # 直近1年分の日付をスキャン（EDINETはコード検索非対応のため日付ループ）
    print(f"\n=== {code} の直近提出書類を検索 ===")
    today = date.today()
    for days_back in range(0, 365, 7):
        target = (today - timedelta(days=days_back)).strftime("%Y-%m-%d")
        docs = fetch_doc_list(target)
        for doc in docs:
            sec = (doc.get("secCode", "") or "").rstrip("0")
            if sec == code and doc.get("docTypeCode") in {DOC_TYPE_ANNUAL, DOC_TYPE_QUARTERLY}:
                doc_id = doc["docID"]
                period_end = doc.get("periodEnd", "")
                filer = doc.get("filerName", "")
                doc_type = {DOC_TYPE_ANNUAL: "有価証券報告書", DOC_TYPE_QUARTERLY: "四半期報告書"}.get(doc["docTypeCode"], "")
                print(f"  発見: {filer} {doc_type} 期末={period_end}")
                raw = fetch_xbrl_inline(doc_id)
                if raw:
                    figures = parse_key_figures(raw)
                    name = companies.get(code, filer)
                    save_financial(code, name, doc_id, period_end, doc_type, figures)
                return
        time.sleep(0.2)
    print(f"  {code} の書類が見つかりませんでした")


def main():
    parser = argparse.ArgumentParser(description="EDINET財務データ取得")
    parser.add_argument("--date", help="取得日 YYYY-MM-DD")
    parser.add_argument("--code", help="証券コード（4桁）")
    parser.add_argument("--today", action="store_true", help="今日の提出書類を取得")
    parser.add_argument("--schedule-only", action="store_true", help="XBRLを取得せずスケジュールのみ更新")
    args = parser.parse_args()

    companies = load_companies()

    if args.today:
        target = date.today().strftime("%Y-%m-%d")
        process_date(target, companies, fetch_xbrl=not args.schedule_only)
    elif args.date:
        process_date(args.date, companies, fetch_xbrl=not args.schedule_only)
    elif args.code:
        process_code(args.code, companies)
    else:
        # デフォルト: 今日のスケジュールのみ更新
        target = date.today().strftime("%Y-%m-%d")
        process_date(target, companies, fetch_xbrl=False)


if __name__ == "__main__":
    main()
