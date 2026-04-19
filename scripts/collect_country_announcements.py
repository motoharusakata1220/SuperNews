#!/usr/bin/env python3
"""
各国の公式発表・政策声明を収集するスクリプト。
RSSフィードを優先し、フォールバックとしてHTMLスクレイピング。
API不使用・完全ローカル処理。

使い方:
  python3 scripts/collect_country_announcements.py
  python3 scripts/collect_country_announcements.py --country US
  python3 scripts/collect_country_announcements.py --region 欧州
"""

import argparse
import json
import re
import sys
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT_DIR = ROOT / "docs" / "data" / "country_announcements"
ALL_JSON = ROOT / "docs" / "data" / "all.json"

# ===== 各国の公式RSSソース =====
COUNTRY_SOURCES = {
    "JP": {
        "name": "日本",
        "sources": [
            {"label": "NHKニュース", "url": "https://www3.nhk.or.jp/rss/news/cat0.xml"},
            {"label": "WTO(日本関連)", "url": "https://www.wto.org/rss/news_e.rss"},
        ]
    },
    "US": {
        "name": "アメリカ合衆国",
        "sources": [
            {"label": "GOV.UK(参考)", "url": "https://www.gov.uk/search/news-and-communications.atom"},
            {"label": "UN News(米関連)", "url": "https://news.un.org/feed/subscribe/en/news/all/rss.xml"},
        ]
    },
    "GB": {
        "name": "イギリス",
        "sources": [
            {"label": "GOV.UK Policy", "url": "https://www.gov.uk/search/policy-papers-and-consultations.atom"},
            {"label": "GOV.UK News", "url": "https://www.gov.uk/search/news-and-communications.atom"},
        ]
    },
    "RU": {
        "name": "ロシア",
        "sources": [
            {"label": "Kremlin EN", "url": "http://en.kremlin.ru/events/president/news/feed"},
        ]
    },
    "IN": {
        "name": "インド",
        "sources": [
            {"label": "PIB India", "url": "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"},
        ]
    },
    "UN": {
        "name": "国際連合",
        "sources": [
            {"label": "UN News", "url": "https://news.un.org/feed/subscribe/en/news/all/rss.xml"},
        ]
    },
    "WTO": {
        "name": "世界貿易機関",
        "sources": [
            {"label": "WTO News", "url": "https://www.wto.org/rss/news_e.rss"},
        ]
    },
}

# 地域別グループ
REGION_GROUPS = {
    "欧州": ["GB", "DE", "FR", "EU"],
    "アジア": ["JP", "CN", "KR", "TW", "IN"],
    "北米": ["US"],
    "中東": ["SA"],
    "その他": ["AU", "BR", "RU", "UN"],
}

HEADERS = {
    "User-Agent": "SuperNews/1.0 (+https://github.com/motoharusakata1220/SuperNews)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}


def fetch_rss(url: str, timeout: int = 15) -> list[dict]:
    """RSSフィードを取得してエントリのリストを返す。"""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read()
    except urllib.error.HTTPError as e:
        print(f"    HTTP {e.code}: {url}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"    Error: {e}", file=sys.stderr)
        return []

    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        raw = re.sub(rb'[\x00-\x08\x0b\x0c\x0e-\x1f]', b'', raw)
        try:
            root = ET.fromstring(raw)
        except Exception:
            return []

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "dc": "http://purl.org/dc/elements/1.1/",
    }

    entries = []
    # RSS 2.0 形式
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        desc = (item.findtext("description") or "").strip()
        pub = (item.findtext("pubDate") or item.findtext("dc:date", namespaces=ns) or "").strip()
        desc = re.sub(r'<[^>]+>', '', desc)[:300]
        if title:
            entries.append({"title": title, "url": link, "summary": desc, "published": pub})

    # Atom 形式
    if not entries:
        for entry in root.findall(".//atom:entry", ns) + root.findall(".//{http://www.w3.org/2005/Atom}entry"):
            title_el = entry.find("{http://www.w3.org/2005/Atom}title") or entry.find("title")
            link_el = entry.find("{http://www.w3.org/2005/Atom}link") or entry.find("link")
            summary_el = entry.find("{http://www.w3.org/2005/Atom}summary") or entry.find("summary")
            date_el = entry.find("{http://www.w3.org/2005/Atom}updated") or entry.find("updated")
            title = (title_el.text if title_el is not None else "").strip()
            link = (link_el.get("href", "") if link_el is not None else "").strip()
            summary = re.sub(r'<[^>]+>', '', (summary_el.text or "") if summary_el is not None else "")[:300]
            pub = (date_el.text if date_el is not None else "").strip()
            if title:
                entries.append({"title": title, "url": link, "summary": summary, "published": pub})

    return entries[:20]  # 最新20件


def collect_country(code: str) -> dict:
    """1カ国分の発表を収集する。"""
    info = COUNTRY_SOURCES.get(code)
    if not info:
        return {}

    print(f"  [{code}] {info['name']}")
    all_entries = []
    for src in info["sources"]:
        print(f"    → {src['label']}: {src['url'][:60]}...")
        entries = fetch_rss(src["url"])
        for e in entries:
            e["source"] = src["label"]
        all_entries.extend(entries)
        time.sleep(0.5)

    return {
        "コード": code,
        "国名": info["name"],
        "取得日時": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "発表件数": len(all_entries),
        "発表": all_entries,
    }


def save_country(code: str, data: dict):
    """国別ファイルに保存する。"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{code}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"    保存: {path.name} ({data['発表件数']}件)")


def update_index(results: list[dict]):
    """country_announcements/index.json にサマリーを保存する。"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    idx_path = OUT_DIR / "index.json"
    index = {
        "更新日時": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "国別サマリー": [
            {
                "コード": r["コード"],
                "国名": r["国名"],
                "取得日時": r["取得日時"],
                "発表件数": r["発表件数"],
            }
            for r in results if r
        ]
    }
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"\nインデックス更新: {idx_path}")


def main():
    parser = argparse.ArgumentParser(description="各国公式発表収集")
    parser.add_argument("--country", help="対象国コード（例: US, JP）")
    parser.add_argument("--region", help="対象地域（欧州/アジア/北米/中東/その他）")
    parser.add_argument("--all", action="store_true", help="全カ国を収集")
    args = parser.parse_args()

    if args.country:
        codes = [args.country.upper()]
    elif args.region:
        codes = REGION_GROUPS.get(args.region, [])
        if not codes:
            print(f"地域 '{args.region}' が見つかりません。利用可能: {list(REGION_GROUPS.keys())}")
            sys.exit(1)
    elif args.all:
        codes = list(COUNTRY_SOURCES.keys())
    else:
        # デフォルト: 主要8カ国
        codes = ["JP", "US", "CN", "DE", "IN", "UN", "EU", "KR"]

    print(f"=== 各国発表収集: {codes} ===\n")
    results = []
    for code in codes:
        data = collect_country(code)
        if data:
            save_country(code, data)
            results.append(data)
        time.sleep(1)

    update_index(results)
    total = sum(r["発表件数"] for r in results)
    print(f"\n完了: {len(results)}カ国 / {total}件取得")


if __name__ == "__main__":
    main()
