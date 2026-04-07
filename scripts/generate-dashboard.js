#!/usr/bin/env node
/**
 * generate-dashboard.js
 * output/動画/data/ 配下のJSONファイルと各カテゴリのoutputを読み込み、
 * 全データを埋め込んだダッシュボードHTMLを生成する。
 *
 * 使い方: node scripts/generate-dashboard.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DASH_DATA = path.join(ROOT, 'output', '動画', 'data');
const OUTPUT_HTML = path.join(ROOT, 'output', '動画', 'ダッシュボード.html');

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function h(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ===== データ読み込み =====
console.log('データ読み込み中...');

// 世界情勢
const worldRaw = readJson(path.join(DASH_DATA, 'world-news.json'));
const worldArticles = worldRaw?.articles || [];

// 経済指標
const ecoRaw = readJson(path.join(DASH_DATA, 'economy.json'));
// 経済指標は最新N件に制限（HTMLが巨大になるため）
const ecoDaily = (ecoRaw?.['日次指標']?.data || []).slice(0, 50);
const ecoMonthly = (ecoRaw?.['月次指標']?.data || []).slice(0, 100);
const ecoQuarterly = (ecoRaw?.['四半期指標']?.data || []).slice(0, 50);
const ecoYearly = (ecoRaw?.['年次指標']?.data || []).slice(0, 200);
const ecoCountry = ecoRaw?.['国別指標'] || {};

// 投資
const investRaw = readJson(path.join(DASH_DATA, 'invest.json'));
const investChannels = investRaw?.channels || [];
const investVideos = investRaw?.videos || [];

// 企業情報
const companyRaw = readJson(path.join(DASH_DATA, 'company.json'));
const companyReports = companyRaw?.reports || [];

// 背景知識
const knowledgeRaw = readJson(path.join(DASH_DATA, 'knowledge.json'));
const countryContexts = knowledgeRaw?.countryContexts || {};
const themes = knowledgeRaw?.themeBackgrounds || [];
const ecoHistory = knowledgeRaw?.economicHistory || [];
const timelines = knowledgeRaw?.timelines || [];

// 関係性
const relRaw = readJson(path.join(DASH_DATA, 'relations.json'));
const newsRelations = relRaw?.newsRelations || [];
const countryRelations = relRaw?.countryRelations || [];

// 統計
const stats = {
  countries: Object.keys(countryContexts).length,
  news: worldArticles.length,
  indicators: ecoDaily.length + ecoMonthly.length + ecoQuarterly.length + ecoYearly.length,
  companies: companyReports.length,
  channels: investChannels.length,
  videos: investVideos.length,
  relations: newsRelations.length + countryRelations.length,
  themes: themes.length + ecoHistory.length + timelines.length,
};

const generatedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
const generatedDate = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });

console.log(`  世界情勢: ${worldArticles.length}件`);
console.log(`  経済指標: ${stats.indicators}件`);
console.log(`  投資: チャンネル${investChannels.length}件, 動画${investVideos.length}件`);
console.log(`  企業情報: ${companyReports.length}件`);
console.log(`  背景知識: ${stats.countries}カ国`);
console.log(`  関係性: ${stats.relations}件`);

// ===== カテゴリ分類 =====
const newsByCategory = {};
worldArticles.forEach(a => {
  const cat = a.category || 'その他';
  if (!newsByCategory[cat]) newsByCategory[cat] = [];
  newsByCategory[cat].push(a);
});
const newsCategories = Object.keys(newsByCategory).sort();

// ===== 翻訳マッピング =====
const countryJa = {
  'United States':'アメリカ','Japan':'日本','China':'中国','Germany':'ドイツ',
  'United Kingdom':'イギリス','France':'フランス','India':'インド','Brazil':'ブラジル',
  'South Korea':'韓国','Australia':'オーストラリア','Canada':'カナダ','Italy':'イタリア',
  'Mexico':'メキシコ','Indonesia':'インドネシア','Turkey':'トルコ','EU':'EU','Russia':'ロシア'
};
function ja(name) { return countryJa[name] || name; }

// ===== ニュース記事HTML =====
function renderArticles(articles) {
  return articles.map(a => `
    <div class="ar">
      <div class="ar-t">${h(a.title)}</div>
      <div class="ar-m">${h(a.source || '')} — ${h(a.publishedAt?.slice(0, 10) || '')}</div>
      <div class="ar-d">${h(a.description || '')}</div>
    </div>`).join('');
}

// ===== 経済指標テーブルHTML =====
function renderEcoTable(data, showSource) {
  const rows = data.map(d => `
    <tr><td>${h(ja(d.country))}</td><td>${h(d.indicator)}</td>
    <td style="font-weight:700;color:var(--ac2)">${typeof d.value === 'number' ? d.value.toLocaleString() : h(String(d.value ?? '-'))}</td>
    <td>${h(d.unit || '')}</td><td>${h(d.date || '')}</td>
    ${showSource ? `<td style="color:var(--mt)">${h(d.source || '')}</td>` : ''}</tr>`).join('');
  return `<table><tr><th>国</th><th>指標</th><th>値</th><th>単位</th><th>日付</th>${showSource ? '<th>ソース</th>' : ''}</tr>${rows}</table>`;
}

// ===== 国別背景知識HTML =====
function renderCountries() {
  return Object.entries(countryContexts).map(([code, c]) => `
    <div class="cc">
      <div class="cc-code">${code} <span style="font-size:13px;font-weight:400;color:var(--mt)">${h(c.politicalSystem?.slice(0, 30) || '')}</span></div>
      <div class="cc-eco">${h((c.economicStructure || '').slice(0, 200))}</div>
      <div style="margin-top:6px">${(c.alliances || []).map(a => `<span class="tg t-i">${h(a)}</span>`).join('')}</div>
      <ul style="padding-left:14px;margin-top:6px">${(c.tensions || []).map(t => `<li style="font-size:11px;color:var(--mt)">${h(t)}</li>`).join('')}</ul>
    </div>`).join('');
}

// ===== 関係性HTML =====
function renderNewsRelations() {
  return newsRelations.map(r => {
    const src = (r.sourceId || '').split('/').pop()?.slice(0, 40) || r.sourceId;
    const tgt = (r.targetId || '').split('/').pop()?.slice(0, 40) || r.targetId;
    return `<div class="rl">
      <span class="rt r-${r.relationType}">${r.relationType}</span>
      <span style="font-weight:600;font-size:11px">${h(src)}</span>
      <span style="color:var(--mt)">↔</span>
      <span style="font-weight:600;font-size:11px">${h(tgt)}</span>
      <span style="color:var(--mt);font-size:10px;margin-left:auto">${h(r.description)} (${Math.round((r.confidence || 0) * 100)}%)</span>
    </div>`;
  }).join('');
}

function renderCountryRelations() {
  return countryRelations.map(r => {
    const color = (r.strength || 0) > 0 ? 'var(--g)' : 'var(--r)';
    return `<div class="rl">
      <span class="rt r-${r.relationType}">${r.relationType}</span>
      <span style="font-weight:700">${r.countryA}</span>
      <span style="color:var(--mt)">↔</span>
      <span style="font-weight:700">${r.countryB}</span>
      <span style="color:${color};font-weight:700;margin-left:8px">${r.strength > 0 ? '+' : ''}${r.strength}</span>
      <span style="color:var(--mt);font-size:10px;margin-left:auto">${h(r.context || '')}</span>
    </div>`;
  }).join('');
}

// ===== 投資チャンネルHTML =====
function renderInvestChannels() {
  if (!investChannels.length) return '<p style="color:var(--mt)">データなし</p>';
  return `<table><tr><th>チャンネル</th><th>言語</th><th>ジャンル</th><th>備考</th></tr>
    ${investChannels.map(c => `<tr><td style="font-weight:600">${h(c.name)}</td><td><span class="tg ${c.language === 'ja' ? 't-w' : 't-t'}">${h(c.language)}</span></td><td>${h(c.genre)}</td><td style="color:var(--mt);font-size:11px">${h(c.note)}</td></tr>`).join('')}</table>`;
}

function renderInvestVideos() {
  return investVideos.map(v => `
    <div class="ar">
      <div class="ar-t">${h(v.title)}</div>
      <div class="ar-m">${h(v.published?.slice(0, 10) || '')}</div>
    </div>`).join('') || '<p style="color:var(--mt)">データなし</p>';
}

// ===== ニュースカテゴリサブタブ =====
function renderNewsTabs() {
  const btns = newsCategories.map((c, i) => {
    const cnt = newsByCategory[c].length;
    return `<button class="${i === 0 ? 'active' : ''}" onclick="subTab(this,'wp')">${h(c)} (${cnt})</button>`;
  }).join('');
  const panels = newsCategories.map((c, i) => `
    <div class="sub-pn ${i === 0 ? 'active' : ''}" data-group="wp">
      <div class="cd"><h2>${h(c)} (${newsByCategory[c].length}件)</h2>${renderArticles(newsByCategory[c])}</div>
    </div>`).join('');
  return `<div class="sub-tabs">${btns}</div>${panels}`;
}

// ===== HTML生成 =====
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SuperNews — 全情報ダッシュボード</title>
<style>
:root{--bg:#0f1117;--s:#1a1d27;--s2:#232738;--bd:#2d3148;--tx:#e4e6f0;--mt:#8b8fa8;--ac:#6c5ce7;--ac2:#a29bfe;--r:#ff6b6b;--o:#ffa94d;--g:#51cf66;--b:#339af0;--cy:#22b8cf;--pk:#f06595;--y:#ffd43b}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--tx);font-family:'Segoe UI',-apple-system,sans-serif;line-height:1.6}.ct{max-width:1440px;margin:0 auto;padding:20px}
header{background:linear-gradient(135deg,#1a1d27,#2d1b69);border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid var(--bd)}
header h1{font-size:28px;background:linear-gradient(90deg,#a29bfe,#6c5ce7,#fd79a8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}header p{color:var(--mt);margin-top:4px}
.sr{display:flex;gap:12px;margin-top:20px;flex-wrap:wrap}.sc{background:rgba(108,92,231,.15);border:1px solid rgba(108,92,231,.3);border-radius:12px;padding:14px 18px;flex:1;min-width:120px}.sc .n{font-size:26px;font-weight:700;color:var(--ac2)}.sc .l{font-size:11px;color:var(--mt);text-transform:uppercase;letter-spacing:1px}
.nav{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;position:sticky;top:0;z-index:10;background:var(--bg);padding:8px 0}
.nav button{background:var(--s);border:1px solid var(--bd);color:var(--mt);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;transition:.2s}.nav button:hover{border-color:var(--ac);color:var(--tx)}.nav button.active{background:var(--ac);border-color:var(--ac);color:#fff}
.sb{width:100%;padding:10px 14px;background:var(--s);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:14px;margin-bottom:16px;outline:none}.sb:focus{border-color:var(--ac)}
.pn{display:none}.pn.active{display:block}
.cd{background:var(--s);border:1px solid var(--bd);border-radius:14px;padding:20px;margin-bottom:14px;transition:.2s}.cd:hover{border-color:var(--ac)}.cd h2{font-size:17px;margin-bottom:10px}.cd h3{font-size:14px;color:var(--ac2);margin:14px 0 6px}
.tg{display:inline-block;padding:2px 8px;border-radius:16px;font-size:10px;font-weight:600;margin:2px}
.t-i{background:rgba(51,154,240,.2);color:var(--b)}.t-w{background:rgba(255,107,107,.2);color:var(--r)}.t-c{background:rgba(81,207,102,.2);color:var(--g)}.t-e{background:rgba(255,169,77,.2);color:var(--o)}.t-k{background:rgba(162,155,254,.2);color:var(--ac2)}.t-t{background:rgba(34,184,207,.2);color:var(--cy)}.t-p{background:rgba(240,101,149,.2);color:var(--pk)}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--bd);font-size:12px}th{color:var(--mt);font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:1px}tr:hover{background:rgba(108,92,231,.05)}
.ar{padding:12px 0;border-bottom:1px solid var(--bd)}.ar:last-child{border-bottom:none}.ar-t{font-weight:600;font-size:13px}.ar-m{font-size:11px;color:var(--mt);margin-top:3px}.ar-d{font-size:12px;color:var(--mt);margin-top:4px;line-height:1.4}
.rl{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--bd);font-size:12px;flex-wrap:wrap}
.rt{padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;min-width:50px;text-align:center}
.r-関連{background:rgba(51,154,240,.2);color:var(--b)}.r-対立{background:rgba(255,107,107,.2);color:var(--r)}.r-連鎖{background:rgba(81,207,102,.2);color:var(--g)}.r-貿易{background:rgba(255,169,77,.2);color:var(--o)}.r-紛争{background:rgba(240,101,149,.2);color:var(--pk)}
.cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.cc{background:var(--s2);border-radius:10px;padding:16px;border:1px solid var(--bd)}.cc-code{font-size:22px;font-weight:800;color:var(--ac)}.cc-eco{font-size:11px;color:var(--mt);line-height:1.4;margin:6px 0}
.sub-tabs{display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap}.sub-tabs button{background:var(--s2);border:1px solid var(--bd);color:var(--mt);padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px}.sub-tabs button.active{background:var(--ac);color:#fff;border-color:var(--ac)}
.sub-pn{display:none}.sub-pn.active{display:block}
.update-badge{background:rgba(81,207,102,.2);color:var(--g);padding:4px 12px;border-radius:8px;font-size:11px;font-weight:600}
@media(max-width:768px){.ct{padding:10px}.sr{flex-direction:column}.cg{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="ct">
<header>
<h1>SuperNews — 全情報ダッシュボード</h1>
<p>自動更新: 毎日 JST 0:00 | 最終更新: <span class="update-badge">${generatedAt}</span></p>
<div class="sr">
  <div class="sc"><div class="n">${stats.news}</div><div class="l">ニュース記事</div></div>
  <div class="sc"><div class="n">${stats.indicators}</div><div class="l">経済指標</div></div>
  <div class="sc"><div class="n">${stats.countries}</div><div class="l">国の背景知識</div></div>
  <div class="sc"><div class="n">${stats.channels}</div><div class="l">投資チャンネル</div></div>
  <div class="sc"><div class="n">${stats.relations}</div><div class="l">関係性</div></div>
  <div class="sc"><div class="n">${stats.themes}</div><div class="l">テーマ・経済史</div></div>
</div>
</header>

<div class="nav" id="nav"></div>
<input type="text" class="sb" id="search" placeholder="記事・指標・国名・企業名で検索...">

<div class="pn active" id="p-world"></div>
<div class="pn" id="p-economy"></div>
<div class="pn" id="p-invest"></div>
<div class="pn" id="p-knowledge"></div>
<div class="pn" id="p-relations"></div>
</div>
<script>
function subTab(btn,group){
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const panels=btn.closest('.pn').querySelectorAll('.sub-pn[data-group="'+group+'"]');
  const idx=[...btn.parentElement.children].indexOf(btn);
  panels.forEach((p,i)=>{p.classList.toggle('active',i===idx)});
}
const tabs=[
  {id:'world',l:'世界情勢 (${worldArticles.length})'},
  {id:'economy',l:'経済指標 (${stats.indicators})'},
  {id:'invest',l:'投資 (${stats.channels}ch/${stats.videos}本)'},
  {id:'knowledge',l:'背景知識 (${stats.countries}国)'},
  {id:'relations',l:'関係性 (${stats.relations})'},
];
const nav=document.getElementById('nav');
tabs.forEach((t,i)=>{const b=document.createElement('button');b.textContent=t.l;b.className=i===0?'active':'';b.onclick=()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.pn').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById('p-'+t.id).classList.add('active')};nav.appendChild(b)});
document.getElementById('search').addEventListener('input',function(e){const q=e.target.value.toLowerCase();document.querySelectorAll('.ar,.rl,tr:not(:first-child),.cc').forEach(el=>{el.style.display=!q||el.textContent.toLowerCase().includes(q)?'':'none'})});
</script>
</body>
</html>`;

// パネル内容を挿入
const finalHtml = html
  .replace('id="p-world"></div>', `id="p-world">${renderNewsTabs()}</div>`)
  .replace('id="p-economy"></div>', `id="p-economy">
    <div class="sub-tabs">
      <button class="active" onclick="subTab(this,'ec')">日次 (${ecoDaily.length})</button>
      <button onclick="subTab(this,'ec')">月次 (${ecoMonthly.length})</button>
      <button onclick="subTab(this,'ec')">四半期 (${ecoQuarterly.length})</button>
      <button onclick="subTab(this,'ec')">年次 (${ecoYearly.length})</button>
    </div>
    <div class="sub-pn active" data-group="ec"><div class="cd"><h2>日次指標</h2>${renderEcoTable(ecoDaily, true)}</div></div>
    <div class="sub-pn" data-group="ec"><div class="cd"><h2>月次指標</h2>${renderEcoTable(ecoMonthly, true)}</div></div>
    <div class="sub-pn" data-group="ec"><div class="cd"><h2>四半期指標</h2>${renderEcoTable(ecoQuarterly, false)}</div></div>
    <div class="sub-pn" data-group="ec"><div class="cd"><h2>年次指標</h2>${renderEcoTable(ecoYearly, true)}</div></div>
  </div>`)
  .replace('id="p-invest"></div>', `id="p-invest">
    <div class="cd"><h2>監視チャンネル (${investChannels.length}件)</h2>${renderInvestChannels()}</div>
    <div class="cd"><h2>動画サマリー (${investVideos.length}件)</h2>${renderInvestVideos()}</div>
  </div>`)
  .replace('id="p-knowledge"></div>', `id="p-knowledge">
    <div class="cg">${renderCountries()}</div>
  </div>`)
  .replace('id="p-relations"></div>', `id="p-relations">
    <div class="cd"><h2>ニュース間の関係性 (${newsRelations.length}件)</h2>${renderNewsRelations()}</div>
    <div class="cd"><h2>国家間の関係性 (${countryRelations.length}件)</h2>${renderCountryRelations()}</div>
  </div>`);

fs.mkdirSync(path.dirname(OUTPUT_HTML), { recursive: true });
fs.writeFileSync(OUTPUT_HTML, finalHtml, 'utf8');
console.log(`\nダッシュボード生成完了: ${OUTPUT_HTML}`);
console.log(`合計データ: ニュース${stats.news}件, 指標${stats.indicators}件, ${stats.countries}カ国, 関係性${stats.relations}件`);
