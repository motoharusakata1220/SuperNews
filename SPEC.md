# SuperNews — プロジェクト仕様書

最終更新: 2026-04-19

---

## プロジェクト概要

横断的知識を得ながら、カテゴリーごとに自動的にニッチな情報を収集し、動画生成まで行う自動化ツール。
- Claude Code を VPN 経由で24時間稼働させ、API コストゼロで運用する
- GitHub Pages（`/docs` フォルダ）でダッシュボードをホスティング

---

## コアコンセプト：カテゴリー × 情報の統合

**すべての情報はカテゴリー → サブカテゴリー（素材・製品粒度）で統一管理する。**

例：
```
エネルギー
  ├ 水素      → ニュース記事 + シェア・統計 + 用語 + 関連企業
  ├ ヘリウム  → ニュース記事 + シェア・統計 + 用語 + 関連企業
  ├ LNG       → ニュース記事 + シェア・統計 + 用語 + 関連企業
  └ 太陽光発電 → ...

半導体・電子部品
  ├ シリコンウエハー → ニュース + 信越化学23.7%...
  ├ フォトレジスト   → ニュース + 東京応化24.7%...
  └ ...
```

ニュース・シェアデータ・用語集・企業データが同じサブカテゴリー軸でつながること。

---

## 調査ローテーション

- 1日1カテゴリーを深掘り調査（一度に全カテゴリーを調査しない）
- `market_share.json` の `調査ローテーション` フィールドで管理
- カテゴリー順序（14カテゴリー）:
  1. 半導体・電子部品
  2. AI・テクノロジー
  3. 自動車・モビリティ
  4. エネルギー
  5. 製薬・ヘルスケア
  6. 農業・食料
  7. 金融市場
  8. 物流・サプライチェーン
  9. マクロ経済
  10. 地政学・安全保障
  11. 外交・国際関係
  12. 規制・法制度
  13. 国内政治・社会
  14. 企業動向

---

## ダッシュボード機能一覧

### 稼働中の機能
| 機能 | データ | 備考 |
|------|--------|------|
| 世界情勢ニュース | `all.json` 43記事 | サブカテゴリータグ付き |
| 経済指標 | `indicators.json` 88項目 | 9カテゴリー（物価・金利・雇用・株式・為替等） |
| 投資 | 12チャンネル・7本動画 | — |
| 背景知識 | `knowledge.json` 4階層設計 | カテゴリー→要素→中要素→事象のナビゲーター |
| 国際関係 | `international_relations.json` | 二国間15件・多国間枠組み15件 |
| 上場企業一覧 | `companies.json` 3,745社 | lazy load |
| 企業プロファイル | `companies_profile.json` 80社 | 日本主要企業・14フィールド |
| シェア・統計 | `market_share.json` | 14カテゴリー・59製品 |
| 用語集 | `glossary.json` 780語 | 14カテゴリー・lazy load |
| 世界の国々 | `countries.json` 196カ国 | 107カ国に詳細フィールド追加 |
| 決算書 | `financials/{コード}.json` | EDINET取得・コード検索 |
| 決算スケジュール | `financials/schedules.json` | 提出日・種別フィルター |
| 各国発表 | `country_announcements/` | RSS収集・国選択 |

### 追加予定機能
| 機能 | データソース | 優先度 |
|------|-------------|--------|
| 背景知識のJSON化・ダッシュボード連携 | `knowledge.json` リファクタリング | 高 |
| 国際関係パネルのJSON駆動化 | `international_relations.json` | 高 |
| 企業プロファイルとcompanies.jsonの連携表示 | `companies_profile.json` | 中 |
| 各国発表の収集対象拡大 | RSS整備（現在7カ国/機関） | 中 |
| 動画自動生成 | Claude Code + 外部ツール | 低 |

---

## UIデザイン方針

- **スタイル**: Bloomberg / TradingView ライクなモダンダーク
- **カラーパレット**: `--bg:#070710` / `--ac:#3b82f6` / `--g:#22d3a0` / `--r:#f25c6e`
- **ヘッダー**: 為替・株価ティッカーが横に自動スクロール（CSSアニメーション）
- **サイドバー構成**（左固定 220px）:
  ```
  📰 ニュース・情報
     ├ 世界情勢
     ├ 世界の国々 (196カ国)
     └ 各国発表

  📊 マーケット・経済
     ├ 経済指標
     ├ シェア・統計
     └ 投資

  🏢 企業・決算
     ├ 上場企業 (3,745社)
     ├ 決算書 (B/S・P/L・CF)
     └ 決算スケジュール

  📚 ナレッジ
     ├ 用語集 (780語)
     ├ 背景知識
     └ 国際関係
  ```

---

## データファイル構成

```
docs/data/
├── all.json                      # ニュース記事（43件・サブカテゴリー付き）
├── companies.json                # JPX上場3,745社
├── countries.json                # 世界196カ国（ISO2コード・旗・GDP・人口・加盟組織・概要）
├── glossary.json                 # 用語集780語（14カテゴリー）
├── market_share.json             # シェア・統計（半導体7品目・ローテーション管理）
├── indicators.json               # 経済指標88項目（9カテゴリー）
├── international_relations.json  # 国際関係（二国間15件・多国間15件）
├── companies_profile.json        # 主要企業プロファイル（80社・14フィールド）
├── earnings.json                 # 決算データ（別系統）
├── country_announcements/        # 各国公式発表（RSSから収集）
│   ├── index.json                # 収集サマリー
│   ├── JP.json                   # 日本（NHK等）
│   ├── UN.json                   # 国際連合
│   └── {コード}.json             # 各国
└── financials/                   # 決算書データ（EDINET取得）
    ├── schedules.json            # 決算発表スケジュール
    └── {証券コード}.json         # 各社 B/S・P/L・CF
```

---

## スクリプト一覧

```
scripts/
├── fetch_edinet_financials.py    # EDINET API で決算書取得（EDINET_API_KEY 必要）
│   # 使い方: python3 scripts/fetch_edinet_financials.py --code 7203
│   # キー取得: https://disclosure2dl.edinet-fsa.go.jp/
├── tag_news_subcategory.py       # all.json にサブカテゴリータグを付与
│   # 使い方: python3 scripts/tag_news_subcategory.py
├── collect_country_announcements.py  # 各国公式RSSから発表を収集
│   # 使い方: python3 scripts/collect_country_announcements.py [--country JP]
├── daily-update.sh               # 日次更新バッチ
├── aggregate.sh                  # データ集約
└── deploy.sh                     # GitHub Pages デプロイ補助
```

---

## 技術スタック

- **フロントエンド**: バニラHTML/CSS/JavaScript（フレームワークなし）
- **データ取得**: Python スクリプト（`scripts/` フォルダ）
- **スケジューリング**: Claude Code Remote Trigger（設定済み・要確認）
- **ホスティング**: GitHub Pages（`/docs` フォルダ）
- **外部API**:
  - EDINET API（決算書・無料・要APIキー登録）
  - 各国政府・国際機関 RSS（無料・無認証）

---

## 既知のバグ・課題

- [x] ~~subTabボタンが機能しない~~ → `classList.add/remove` に修正済み
- [ ] ニュースのサブカテゴリーフィルターUIが未実装（タグは付与済み）
- [ ] 各国発表RSS: 日本（官邸・外務省・財務省）が403/404でデータ0件
- [ ] EDINETキーが未設定のため決算書データが空

---

## 情報収集計画

詳細は [`COLLECTION_PLAN.md`](COLLECTION_PLAN.md) を参照。

| 現状 | 目標 | 充足率 |
|------|------|--------|
| market_share: 62品目 | 210品目 | 30% |
| market_share 要因分析: 1品目 | 全品目 | 2% |
| companies_profile: 86社 | 300社 | 29% |
| countries 詳細: 107/196カ国 | 196カ国 | 55% |

---

## 作業ルール

- GitHub push は坂田さんの明示的な許可が必要
- API コストは発生させない（Claude Code を24時間稼働で代替）
- **機能追加・変更のたびに必ずこのファイル（`SPEC.md`）を更新する**
- 新機能はダッシュボード機能一覧・データファイル構成・スクリプト一覧の3箇所を更新
