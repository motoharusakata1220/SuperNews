#!/usr/bin/env python3
"""
ニュース記事にサブカテゴリー（水素/ヘリウム粒度）タグを付与するスクリプト。
taxonomy.json の分類ルールに従い、キーワードマッチングでタグ付けする。
API不使用・完全ローカル処理。

使い方:
  python3 scripts/tag_news_subcategory.py
  python3 scripts/tag_news_subcategory.py --dry-run   # 変更なしで確認のみ
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
ALL_JSON = ROOT / "docs" / "data" / "all.json"
TAXONOMY_JSON = ROOT / "docs" / "data" / "taxonomy.json"
OUT_JSON = ROOT / "docs" / "data" / "all.json"

# ===== サブカテゴリー分類ルール =====
# { カテゴリー: { サブカテゴリー: [キーワード, ...] } }
SUBCATEGORY_RULES = {
    "エネルギー": {
        "水素": ["水素", "hydrogen", "FC", "燃料電池", "グリーン水素", "ブルー水素"],
        "ヘリウム": ["ヘリウム", "helium"],
        "LNG": ["LNG", "液化天然ガス", "天然ガス", "liquefied natural gas"],
        "石油": ["石油", "原油", "crude oil", "petroleum", "WTI", "ブレント"],
        "太陽光発電": ["太陽光", "solar", "PV", "メガソーラー", "光発電"],
        "風力発電": ["風力", "wind power", "洋上風力", "offshore wind"],
        "原子力": ["原子力", "原発", "nuclear", "ウラン", "核", "廃炉"],
        "電力": ["電力", "送電", "電気料金", "停電", "スマートグリッド"],
        "石炭": ["石炭", "coal", "コークス"],
        "蓄電池": ["蓄電池", "battery", "リチウムイオン", "全固体電池"],
    },
    "半導体・電子部品": {
        "シリコンウエハー": ["シリコンウエハー", "ウエハー", "wafer", "信越化学", "SUMCO"],
        "ファウンドリ": ["ファウンドリ", "foundry", "TSMC", "受託製造", "Samsung Foundry"],
        "フォトレジスト": ["フォトレジスト", "photoresist", "東京応化", "JSR"],
        "NANDフラッシュ": ["NAND", "フラッシュメモリ", "Kioxia", "キオクシア", "SSD"],
        "DRAM": ["DRAM", "メモリ", "SK Hynix", "Micron", "エルピーダ"],
        "製造装置": ["製造装置", "ASML", "EUV", "露光装置", "東京エレクトロン", "アドバンテスト"],
        "GPU": ["GPU", "NVIDIA", "グラフィックス", "AI半導体"],
        "パワー半導体": ["パワー半導体", "SiC", "GaN", "インバーター"],
        "封止材": ["封止材", "エポキシ", "住友ベークライト"],
    },
    "AI・テクノロジー": {
        "生成AI": ["生成AI", "ChatGPT", "LLM", "大規模言語モデル", "GPT", "Claude", "Gemini"],
        "半導体設計": ["設計", "EDA", "IP", "ARM", "RISC-V", "チップレット"],
        "クラウド": ["クラウド", "AWS", "Azure", "GCP", "データセンター"],
        "量子コンピュータ": ["量子", "quantum", "量子コンピュータ"],
        "ロボティクス": ["ロボット", "robot", "自動化", "無人化"],
        "サイバーセキュリティ": ["サイバー", "cyber", "ハッキング", "マルウェア", "セキュリティ"],
        "宇宙": ["宇宙", "衛星", "ロケット", "SpaceX", "JAXA", "NASA"],
        "5G/6G": ["5G", "6G", "通信規格", "基地局"],
    },
    "自動車・モビリティ": {
        "EV": ["EV", "電気自動車", "electric vehicle", "テスラ", "BYD", "充電"],
        "PHEV": ["PHEV", "プラグインハイブリッド", "HV", "ハイブリッド"],
        "自動運転": ["自動運転", "autonomous", "ADAS", "Waymo"],
        "車載半導体": ["車載半導体", "カーチップ", "MCU"],
        "サプライチェーン": ["自動車部品", "ティア1", "tier 1", "デンソー", "アイシン"],
        "二輪車": ["バイク", "二輪", "オートバイ", "ホンダ二輪"],
        "SAF": ["SAF", "持続可能な航空燃料", "航空燃料"],
        "船舶": ["船舶", "造船", "LNG船", "コンテナ船"],
    },
    "製薬・ヘルスケア": {
        "mRNA": ["mRNA", "ワクチン", "モデルナ", "ファイザー", "BioNTech"],
        "がん治療": ["がん", "抗がん剤", "免疫療法", "CAR-T"],
        "医療AI": ["医療AI", "創薬AI", "drug discovery AI"],
        "後発品": ["後発医薬品", "ジェネリック", "バイオシミラー"],
        "臨床試験": ["臨床試験", "治験", "フェーズ", "phase"],
    },
    "農業・食料": {
        "穀物": ["小麦", "大豆", "トウモロコシ", "米", "穀物", "grain"],
        "肥料": ["肥料", "窒素", "リン", "ポタッシュ", "fertilizer"],
        "農業テック": ["アグリテック", "agtech", "スマート農業", "精密農業"],
        "代替タンパク": ["代替肉", "植物肉", "昆虫食", "培養肉"],
        "水産": ["水産", "漁業", "養殖", "aquaculture"],
    },
    "金融市場": {
        "株式": ["株式", "株価", "IPO", "上場", "配当"],
        "債券": ["国債", "社債", "金利", "利回り", "bond"],
        "為替": ["為替", "ドル円", "ユーロ", "円安", "円高", "FX"],
        "仮想通貨": ["ビットコイン", "仮想通貨", "暗号資産", "crypto", "イーサリアム"],
        "不動産": ["不動産", "REIT", "住宅価格", "オフィス"],
        "コモディティ": ["金", "銀", "銅", "原材料", "commodity"],
    },
    "物流・サプライチェーン": {
        "海運": ["海運", "コンテナ", "運賃", "船賃", "maersk"],
        "航空貨物": ["航空貨物", "air freight", "air cargo"],
        "港湾": ["港湾", "港", "ターミナル"],
        "半導体サプライチェーン": ["半導体供給", "チップ不足", "supply chain"],
        "物流DX": ["物流DX", "自動倉庫", "ドローン配送"],
    },
    "地政学・安全保障": {
        "台湾海峡": ["台湾", "台湾海峡", "中台", "両岸"],
        "ウクライナ": ["ウクライナ", "ロシア", "侵攻", "戦争", "NATO拡大"],
        "中東": ["イスラエル", "ガザ", "パレスチナ", "フーシ", "イラン"],
        "南シナ海": ["南シナ海", "南海", "フィリピン海"],
        "北朝鮮": ["北朝鮮", "DPRK", "ミサイル", "核実験"],
        "米中対立": ["デカップリング", "経済安保", "輸出規制", "制裁"],
    },
    "マクロ経済": {
        "インフレ": ["インフレ", "物価", "CPI", "PPI", "インフレ率"],
        "金融政策": ["利上げ", "利下げ", "FRB", "日銀", "ECB", "金融緩和", "量的緩和"],
        "GDP": ["GDP", "経済成長", "景気"],
        "雇用": ["雇用", "失業率", "賃上げ", "賃金"],
        "財政": ["財政赤字", "国債発行", "財政出動"],
    },
    "規制・法制度": {
        "AI規制": ["AI規制", "AI法", "EU AI Act", "AI安全"],
        "環境規制": ["GHG", "排出規制", "炭素税", "ETS", "カーボン"],
        "データ規制": ["GDPR", "個人情報", "プライバシー", "データ保護"],
        "独占禁止": ["独占禁止", "反トラスト", "antitrust", "競争法"],
    },
}


def load_taxonomy() -> dict:
    """taxonomy.jsonがあれば読み込む（なければ空）。"""
    if TAXONOMY_JSON.exists():
        with open(TAXONOMY_JSON, encoding="utf-8") as f:
            return json.load(f)
    return {}


def detect_subcategory(text: str, category: str) -> str | None:
    """テキストからサブカテゴリーを推定する。"""
    rules = SUBCATEGORY_RULES.get(category, {})
    text_lower = text.lower()
    scores = {}
    for sub, keywords in rules.items():
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        if score > 0:
            scores[sub] = score
    if not scores:
        return None
    return max(scores, key=lambda s: scores[s])


def detect_from_tags(tags: list, category: str) -> str | None:
    """既存の「タグ」リストからサブカテゴリーを推定する。"""
    rules = SUBCATEGORY_RULES.get(category, {})
    for tag in tags:
        tag_lower = tag.lower()
        for sub, keywords in rules.items():
            if any(kw.lower() in tag_lower for kw in keywords):
                return sub
    return None


def tag_articles(articles: list, dry_run: bool = False) -> tuple[int, int]:
    """記事リストにサブカテゴリータグを付与する。変更数を返す。"""
    updated = 0
    skipped = 0
    for a in articles:
        if not isinstance(a, dict):
            continue
        # all.json の構造: カテゴリ, タイトル, 背景, 最新, タグ
        category = a.get("カテゴリ", "") or a.get("category", "") or a.get("カテゴリー", "")
        if not category:
            skipped += 1
            continue

        # 1) 既存タグから推定
        existing_tags = a.get("タグ", [])
        sub = detect_from_tags(existing_tags, category)

        # 2) テキストから推定
        if not sub:
            text = " ".join([
                a.get("タイトル", ""), a.get("title", ""),
                a.get("背景", ""), a.get("最新", ""),
                a.get("summary", ""), a.get("概要", ""),
                " ".join(existing_tags),
            ])
            sub = detect_subcategory(text, category)

        # 3) 紐付きのサブフィールドから
        if not sub:
            for linked in a.get("紐付き", []):
                if linked.get("カテゴリ") == category:
                    sub = linked.get("サブ", "").split("・")[0] or None
                    if sub:
                        break

        if sub:
            if a.get("サブカテゴリー") != sub:
                if not dry_run:
                    a["サブカテゴリー"] = sub
                updated += 1
            else:
                skipped += 1
        else:
            skipped += 1
    return updated, skipped


def main():
    parser = argparse.ArgumentParser(description="ニュースサブカテゴリータグ付け")
    parser.add_argument("--dry-run", action="store_true", help="変更なしで確認のみ")
    args = parser.parse_args()

    if not ALL_JSON.exists():
        print(f"ERROR: {ALL_JSON} が見つかりません", file=sys.stderr)
        sys.exit(1)

    with open(ALL_JSON, encoding="utf-8") as f:
        data = json.load(f)

    # all.json の構造に合わせて記事リストを取得
    articles = []
    if isinstance(data, list):
        articles = data
    elif isinstance(data, dict):
        # all.json の構造: {"情報": [...]}
        for key in ["情報", "articles", "ニュース", "news", "items"]:
            if key in data and isinstance(data[key], list):
                articles = data[key]
                break
        if not articles:
            for v in data.values():
                if isinstance(v, list) and v and isinstance(v[0], dict):
                    articles.extend(v)

    print(f"記事数: {len(articles)}")

    updated, skipped = tag_articles(articles, dry_run=args.dry_run)

    if args.dry_run:
        print(f"[DRY RUN] 更新対象: {updated}件 / スキップ: {skipped}件")
        # サンプル表示
        sample_count = 0
        for a in articles:
            if not isinstance(a, dict):
                continue
            category = a.get("カテゴリ","") or a.get("category", "") or a.get("カテゴリー", "")
            existing_tags = a.get("タグ", [])
            sub = detect_from_tags(existing_tags, category)
            if not sub:
                text = " ".join([a.get("タイトル",""),a.get("title",""),a.get("背景",""),a.get("最新","")," ".join(existing_tags)])
                sub = detect_subcategory(text, category)
            if sub:
                title = a.get("タイトル", a.get("title", ""))
                print(f"  [{category} → {sub}] {title[:60]}")
                sample_count += 1
                if sample_count >= 20:
                    break
    else:
        # 保存
        if isinstance(data, list):
            out = articles
        else:
            out = data
        with open(OUT_JSON, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        print(f"完了: {updated}件を更新、{skipped}件はスキップ → {OUT_JSON}")


if __name__ == "__main__":
    main()
