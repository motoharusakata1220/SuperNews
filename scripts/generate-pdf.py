#!/usr/bin/env python3
"""
全情報をPDFレポートとして出力する。
weasyprint を使用。
"""
import json
import os
from datetime import datetime
from weasyprint import HTML

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'output', '動画', 'data')
OUTPUT_PDF = os.path.join(ROOT, 'output', '動画', 'SuperNews_レポート.pdf')

def load(name):
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def h(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

# データ読み込み
world = load('world-news.json')
eco = load('economy.json')
invest = load('invest.json')
knowledge = load('knowledge.json')
relations = load('relations.json')
company = load('company.json')

articles = world.get('articles', []) if world else []
eco_daily = (eco.get('日次指標', {}).get('data', []) if eco else [])[:30]
eco_monthly = (eco.get('月次指標', {}).get('data', []) if eco else [])[:30]
eco_quarterly = (eco.get('四半期指標', {}).get('data', []) if eco else [])[:20]
eco_yearly = (eco.get('年次指標', {}).get('data', []) if eco else [])[:50]
channels = invest.get('channels', []) if invest else []
videos = invest.get('videos', []) if invest else []
countries = knowledge.get('countryContexts', {}) if knowledge else {}
themes = knowledge.get('themeBackgrounds', []) if knowledge else []
eco_hist = knowledge.get('economicHistory', []) if knowledge else []
timelines = knowledge.get('timelines', []) if knowledge else []
news_rel = relations.get('newsRelations', []) if relations else []
country_rel = relations.get('countryRelations', []) if relations else []

now = datetime.now().strftime('%Y年%m月%d日 %H:%M')

# 国名翻訳
COUNTRY_JA = {
    'United States':'アメリカ','Japan':'日本','China':'中国','Germany':'ドイツ',
    'United Kingdom':'イギリス','France':'フランス','India':'インド','Brazil':'ブラジル',
    'South Korea':'韓国','Australia':'オーストラリア','Canada':'カナダ','Italy':'イタリア',
    'Mexico':'メキシコ','Indonesia':'インドネシア','Turkey':'トルコ','EU':'EU','Russia':'ロシア'
}
def ja(name):
    return COUNTRY_JA.get(name, name)

# カテゴリ分類
cats = {}
for a in articles:
    c = a.get('category', 'その他')
    cats.setdefault(c, []).append(a)

# ===== HTML生成 =====
def eco_table(data, show_source=False):
    rows = ''
    for d in data:
        v = d.get('value', '-')
        if isinstance(v, (int, float)):
            v = f'{v:,.2f}' if isinstance(v, float) else f'{v:,}'
        src = f'<td>{h(d.get("source",""))}</td>' if show_source else ''
        rows += f'<tr><td>{h(ja(d.get("country","")))}</td><td>{h(d.get("indicator",""))}</td><td class="num">{v}</td><td>{h(d.get("unit",""))}</td><td>{h(d.get("date",""))}</td>{src}</tr>\n'
    src_h = '<th>ソース</th>' if show_source else ''
    return f'<table><tr><th>国</th><th>指標</th><th>値</th><th>単位</th><th>日付</th>{src_h}</tr>{rows}</table>'

html = f'''<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8">
<style>
@page {{ size: A4; margin: 20mm 15mm; }}
body {{ font-family: "Noto Sans CJK JP", "Hiragino Sans", sans-serif; font-size: 9pt; color: #1a1a2e; line-height: 1.6; }}
h1 {{ font-size: 22pt; color: #6c5ce7; border-bottom: 3px solid #6c5ce7; padding-bottom: 8px; margin-top: 0; }}
h2 {{ font-size: 14pt; color: #2d3436; border-bottom: 2px solid #dfe6e9; padding-bottom: 4px; margin-top: 24px; page-break-after: avoid; }}
h3 {{ font-size: 11pt; color: #6c5ce7; margin-top: 14px; page-break-after: avoid; }}
h4 {{ font-size: 10pt; color: #636e72; margin-top: 10px; }}
p {{ margin: 4px 0; }}
table {{ width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 8pt; }}
th {{ background: #6c5ce7; color: white; padding: 5px 8px; text-align: left; font-size: 7pt; text-transform: uppercase; }}
td {{ padding: 4px 8px; border-bottom: 1px solid #dfe6e9; }}
tr:nth-child(even) {{ background: #f8f9fa; }}
.num {{ font-weight: 700; color: #6c5ce7; text-align: right; }}
.stat-box {{ display: inline-block; background: #f0f0ff; border: 1px solid #ddd; border-radius: 8px; padding: 10px 16px; margin: 4px; text-align: center; min-width: 100px; }}
.stat-box .n {{ font-size: 20pt; font-weight: 700; color: #6c5ce7; }}
.stat-box .l {{ font-size: 7pt; color: #636e72; text-transform: uppercase; }}
.article {{ padding: 6px 0; border-bottom: 1px solid #eee; }}
.article-title {{ font-weight: 600; font-size: 9pt; }}
.article-meta {{ font-size: 7pt; color: #636e72; }}
.article-desc {{ font-size: 8pt; color: #636e72; margin-top: 2px; }}
.tag {{ display: inline-block; background: #f0f0ff; color: #6c5ce7; padding: 1px 6px; border-radius: 10px; font-size: 7pt; font-weight: 600; margin: 1px; }}
.tag-r {{ background: #fff0f0; color: #e74c3c; }}
.tag-g {{ background: #f0fff0; color: #27ae60; }}
.rel {{ padding: 4px 0; border-bottom: 1px solid #eee; font-size: 8pt; }}
.rel-type {{ display: inline-block; background: #6c5ce7; color: white; padding: 1px 6px; border-radius: 4px; font-size: 7pt; font-weight: 700; min-width: 40px; text-align: center; }}
.country-card {{ border: 1px solid #dfe6e9; border-radius: 8px; padding: 10px; margin: 8px 0; page-break-inside: avoid; }}
.country-code {{ font-size: 16pt; font-weight: 800; color: #6c5ce7; }}
.toc {{ columns: 2; column-gap: 24px; }}
.toc a {{ text-decoration: none; color: #2d3436; display: block; padding: 2px 0; font-size: 9pt; }}
.toc a:hover {{ color: #6c5ce7; }}
.cover {{ text-align: center; padding: 60px 0 40px; }}
.cover h1 {{ font-size: 32pt; border: none; }}
.cover .sub {{ font-size: 12pt; color: #636e72; margin-top: 8px; }}
.footer {{ font-size: 7pt; color: #999; text-align: center; margin-top: 20px; }}
</style>
</head>
<body>

<div class="cover">
<h1>SuperNews</h1>
<div class="sub">全情報レポート — {now}</div>
<div style="margin-top: 30px;">
  <div class="stat-box"><div class="n">{len(articles)}</div><div class="l">ニュース</div></div>
  <div class="stat-box"><div class="n">{len(eco_daily)+len(eco_monthly)+len(eco_quarterly)+len(eco_yearly)}</div><div class="l">経済指標</div></div>
  <div class="stat-box"><div class="n">{len(countries)}</div><div class="l">国</div></div>
  <div class="stat-box"><div class="n">{len(channels)}</div><div class="l">チャンネル</div></div>
  <div class="stat-box"><div class="n">{len(news_rel)+len(country_rel)}</div><div class="l">関係性</div></div>
</div>
</div>

<h2>目次</h2>
<div class="toc">
<a href="#news">1. 世界情勢ニュース ({len(articles)}件)</a>
<a href="#eco">2. 経済指標</a>
<a href="#invest">3. 投資情報</a>
<a href="#company">4. 企業情報</a>
<a href="#knowledge">5. 背景知識 ({len(countries)}カ国)</a>
<a href="#relations">6. 関係性分析</a>
</div>
'''

# ===== 1. 世界情勢ニュース =====
html += '<h2 id="news">1. 世界情勢ニュース</h2>\n'
for cat_name in sorted(cats.keys()):
    cat_articles = cats[cat_name]
    html += f'<h3>{h(cat_name)} ({len(cat_articles)}件)</h3>\n'
    for a in cat_articles[:30]:  # カテゴリあたり最大30件
        title = h(a.get('title', ''))
        source = h(a.get('source', ''))
        date = h(a.get('publishedAt', '')[:10])
        desc = h((a.get('description', '') or '')[:200])
        html += f'''<div class="article">
<div class="article-title">{title}</div>
<div class="article-meta">{source} — {date}</div>
<div class="article-desc">{desc}</div>
</div>\n'''

# ===== 2. 経済指標 =====
html += '<h2 id="eco">2. 経済指標</h2>\n'
if eco_daily:
    html += f'<h3>日次指標 ({len(eco_daily)}件)</h3>\n'
    html += eco_table(eco_daily, True)
if eco_monthly:
    html += f'<h3>月次指標 ({len(eco_monthly)}件)</h3>\n'
    html += eco_table(eco_monthly, True)
if eco_quarterly:
    html += f'<h3>四半期指標 ({len(eco_quarterly)}件)</h3>\n'
    html += eco_table(eco_quarterly, False)
if eco_yearly:
    html += f'<h3>年次指標 ({len(eco_yearly)}件)</h3>\n'
    html += eco_table(eco_yearly, True)

# ===== 3. 投資 =====
html += '<h2 id="invest">3. 投資情報</h2>\n'
html += f'<h3>監視チャンネル ({len(channels)}件)</h3>\n'
html += '<table><tr><th>チャンネル名</th><th>言語</th><th>ジャンル</th><th>備考</th></tr>\n'
for c in channels:
    html += f'<tr><td style="font-weight:600">{h(c.get("name",""))}</td><td>{h(c.get("language",""))}</td><td>{h(c.get("genre",""))}</td><td style="font-size:7pt;color:#636e72">{h(c.get("note",""))}</td></tr>\n'
html += '</table>\n'

html += f'<h3>動画サマリー ({len(videos)}件)</h3>\n'
for v in videos:
    html += f'<div class="article"><div class="article-title">{h(v.get("title",""))}</div><div class="article-meta">{h(v.get("published","")[:10])}</div></div>\n'

# ===== 4. 企業情報 =====
html += '<h2 id="company">4. 企業情報</h2>\n'
if company:
    for r in company.get('reports', []):
        html += f'<h3>{h(r.get("filename",""))}</h3>\n'
        content = r.get('content', '')[:3000]
        html += f'<div style="font-size:8pt;white-space:pre-wrap;color:#636e72">{h(content)}</div>\n'

# ===== 5. 背景知識 =====
html += '<h2 id="knowledge">5. 背景知識</h2>\n'
html += f'<h3>国別コンテキスト ({len(countries)}カ国)</h3>\n'
for code, c in sorted(countries.items()):
    alliances = ' '.join(f'<span class="tag">{h(a)}</span>' for a in c.get('alliances', []))
    tensions = ''.join(f'<li>{h(t)}</li>' for t in c.get('tensions', []))
    eco_str = h((c.get('economicStructure', '') or '')[:300])
    html += f'''<div class="country-card">
<div class="country-code">{code}</div>
<div style="font-size:8pt;color:#636e72">{h(c.get("politicalSystem",""))}</div>
<div style="font-size:8pt;margin:4px 0">{eco_str}</div>
<div style="margin:4px 0">{alliances}</div>
<ul style="font-size:7pt;color:#636e72;padding-left:14px">{tensions}</ul>
</div>\n'''

if themes:
    html += f'<h3>テーマ別背景 ({len(themes)}件)</h3>\n'
    for t in themes:
        html += f'<div class="article"><div class="article-title">{h(t.get("title",""))}</div><div class="article-desc">{h(t.get("summary",""))}</div></div>\n'

if eco_hist:
    html += f'<h3>経済史 ({len(eco_hist)}件)</h3>\n'
    for e in eco_hist:
        html += f'<div class="article"><div class="article-title">{h(e.get("title",""))}</div><div class="article-desc">{h(e.get("summary",""))}</div></div>\n'

if timelines:
    html += f'<h3>タイムライン ({len(timelines)}件)</h3>\n'
    for t in timelines:
        html += f'<div class="article"><div class="article-title">{h(t.get("title",""))}</div><div class="article-desc">{h(t.get("summary",""))}</div></div>\n'

# ===== 6. 関係性 =====
html += '<h2 id="relations">6. 関係性分析</h2>\n'
html += f'<h3>ニュース間の関係性 ({len(news_rel)}件)</h3>\n'
for r in news_rel:
    src = (r.get('sourceId', '') or '').split('/')[-1][:40]
    tgt = (r.get('targetId', '') or '').split('/')[-1][:40]
    conf = int((r.get('confidence', 0)) * 100)
    html += f'<div class="rel"><span class="rel-type">{h(r.get("relationType",""))}</span> {h(src)} ↔ {h(tgt)} <span style="color:#999">({h(r.get("description",""))} {conf}%)</span></div>\n'

html += f'<h3>国家間の関係性 ({len(country_rel)}件)</h3>\n'
for r in country_rel:
    st = r.get('strength', 0)
    color = '#27ae60' if st > 0 else '#e74c3c'
    html += f'<div class="rel"><span class="rel-type">{h(r.get("relationType",""))}</span> {h(r.get("countryA",""))} ↔ {h(r.get("countryB",""))} <span style="color:{color};font-weight:700">{st:+.1f}</span> <span style="color:#999">{h(r.get("context",""))}</span></div>\n'

html += f'''
<div class="footer">
SuperNews 全情報レポート | 生成日時: {now} | 自動更新: 毎日 JST 0:00
</div>
</body></html>'''

# PDF生成
print('PDF生成中...')
HTML(string=html).write_pdf(OUTPUT_PDF)
print(f'PDF生成完了: {OUTPUT_PDF}')
print(f'サイズ: {os.path.getsize(OUTPUT_PDF) / 1024:.0f} KB')
