'use strict';

let newsData={カテゴリ一覧:[],情報:[]}, marketData={}, indicatorData={}, earningsData={};
let summaryData={}, policyData={}, knowledgeData={}, taxonomyData={}, companyData={};
let activeSection='overview', activeOverviewDomain='全て', activeIndFilter='全て';
let activeEarnFilter='全て', activePolicyFilter='全て', activeKnowledgeFilter='全て';
let searchQuery='', companyQuery='';

const ICONS={'地政学・安全保障':'\u{1F310}','外交・国際関係':'\u{1F91D}','マクロ経済':'\u{1F4CA}','金融市場':'\u{1F4C8}','エネルギー':'\u26A1','半導体・電子部品':'\u{1F4BE}','自動車・モビリティ':'\u{1F697}','AI・テクノロジー':'\u{1F916}','製薬・ヘルスケア':'\u{1F48A}','農業・食料':'\u{1F33E}','物流・サプライチェーン':'\u{1F6A2}','規制・法制度':'\u2696\uFE0F','国内政治・社会':'\u{1F3DB}\uFE0F','企業動向':'\u{1F3E2}','金属・鉱物':'\u{1F48E}'};
const TITLES={overview:'概要・ニュース',market:'マーケット',indicators:'経済指標',earnings:'決算',policy:'政策・レポート',knowledge:'背景知識'};

async function init(){setupNav();setupSidebar();setupSearch();await loadAll();render()}

async function loadAll(){
  const b='./data/',t=Date.now();
  const [n,m,i,e,s,p,k,tx,co]=await Promise.all([
    fj(b+'all.json?t='+t),fj(b+'market.json?t='+t),fj(b+'indicators.json?t='+t),
    fj(b+'earnings.json?t='+t),fj(b+'summary.json?t='+t),fj(b+'policy.json?t='+t),
    fj(b+'knowledge.json?t='+t),fj(b+'taxonomy.json?t='+t),fj(b+'jp_listed.json?t='+t),
  ]);
  newsData=n||newsData;marketData=m||{};indicatorData=i||{};earningsData=e||{};
  summaryData=s||{};policyData=p||{};knowledgeData=k||{};taxonomyData=tx||{};companyData=co||{};
  document.getElementById('update-time').textContent=newsData.更新日時?fmtDate(newsData.更新日時):'--';
}
async function fj(u){try{const r=await fetch(u);return r.ok?r.json():null}catch{return null}}

function setupNav(){document.getElementById('nav-menu').addEventListener('click',ev=>{const b=ev.target.closest('.nav-item');if(!b)return;const s=b.dataset.section;if(s===activeSection)return;document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeSection=s;document.getElementById('topbar-title').textContent=TITLES[s]||s;render();document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('visible')})}
function setupSidebar(){const sb=document.getElementById('sidebar'),ov=document.getElementById('overlay');document.getElementById('menu-toggle').addEventListener('click',()=>{sb.classList.toggle('open');ov.classList.toggle('visible')});document.getElementById('sidebar-close').addEventListener('click',()=>{sb.classList.remove('open');ov.classList.remove('visible')});ov.addEventListener('click',()=>{sb.classList.remove('open');ov.classList.remove('visible')})}
function setupSearch(){document.getElementById('search-input').addEventListener('input',ev=>{searchQuery=ev.target.value.trim().toLowerCase();render()})}

function render(){
  document.querySelectorAll('#main-content .page').forEach(s=>s.classList.add('hidden'));
  const el=document.getElementById('sec-'+activeSection);if(el)el.classList.remove('hidden');
  ({overview:renderOverview,market:renderMarket,indicators:renderIndicators,earnings:renderEarnings,policy:renderPolicy,knowledge:renderKnowledge})[activeSection]?.();
}

/* ===== OVERVIEW: Categories always visible + news embedded ===== */
function renderOverview(){
  // Metrics
  const metrics=[];
  const add=(l,v,c,p,pf)=>metrics.push({l,v:pf+fmtN(v),c,p});
  if(marketData.株式指数){const nk=marketData.株式指数.find(x=>x.名称==='日経225'),sp=marketData.株式指数.find(x=>x.名称==='S&P 500');if(nk)add('日経225',nk.値,nk.前日比,nk.変化率,'');if(sp)add('S&P 500',sp.値,sp.前日比,sp.変化率,'')}
  if(marketData.為替){const uj=marketData.為替.find(x=>x.名称==='USD/JPY');if(uj)add('USD/JPY',uj.値,uj.前日比,uj.変化率,'')}
  if(marketData.コモディティ){const o=marketData.コモディティ.find(x=>x.名称==='Brent原油'),g=marketData.コモディティ.find(x=>x.名称==='金');if(o)add('Brent',o.値,o.前日比,o.変化率,'$');if(g)add('金',g.値,g.前日比,g.変化率,'$')}
  if(marketData.VIX){const v=marketData.VIX;metrics.push({l:'VIX',v:String(v.値),c:v.前日比,p:v.変化率})}
  document.getElementById('overview-metrics').innerHTML=metrics.map(m=>{const d=m.p>0?'up':m.p<0?'down':'flat',a=m.p>0?'\u25B2':m.p<0?'\u25BC':'';return`<div class="metric-card"><div class="metric-label">${esc(m.l)}</div><div class="metric-value">${esc(m.v)}</div><div class="metric-change ${d}">${a} ${fmtN(Math.abs(m.c))} (${m.p>0?'+':''}${m.p}%)</div></div>`}).join('');

  // Domain filter from taxonomy
  const taxonomy=taxonomyData.分類体系||{};
  const domains=['全て',...Object.keys(taxonomy)];
  document.getElementById('overview-domain-filter').innerHTML=domains.map(d=>`<button class="filter-btn ${d===activeOverviewDomain?'active':''}" data-f="${esc(d)}">${d==='全て'?'':ICONS[d]||''} ${esc(d)}</button>`).join('');
  document.getElementById('overview-domain-filter').querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeOverviewDomain=b.dataset.f;renderOverview()}));

  // Build category tree with summaries + news
  const sums=summaryData.サブトピック要約||[];
  const news=newsData.情報||[];
  const filteredDomains=activeOverviewDomain==='全て'?Object.keys(taxonomy):[activeOverviewDomain];

  let html='';
  for(const domain of filteredDomains){
    const icon=ICONS[domain]||'';
    const sectors=taxonomy[domain]||{};
    let sectorHtml='';

    for(const[sector,topics]of Object.entries(sectors)){
      // Find matching summary
      const sum=sums.find(s=>s.トピック&&(s.トピック.includes(sector)||sector.includes(s.トピック?.split('（')[0])));
      // Find matching news
      const matchingNews=news.filter(n=>{
        const tags=(n.タグ||[]).join(' ').toLowerCase();
        const title=(n.タイトル||'').toLowerCase();
        const sectorLower=sector.toLowerCase();
        return tags.includes(sectorLower)||title.includes(sectorLower)||topics.some(t=>tags.includes(t.toLowerCase())||title.includes(t.toLowerCase()));
      });

      if(searchQuery){
        const match=(sector+topics.join('')+(sum?.情報||'')+(sum?.背景||'')).toLowerCase().includes(searchQuery)||matchingNews.length>0;
        if(!match)continue;
      }

      const topicChips=topics.map(t=>`<span class="tag">${esc(t)}</span>`).join('');
      const newsAccordions=matchingNews.map(item=>`<div class="accordion"><div class="accordion-header"><div class="accordion-arrow">\u25B6</div><div class="accordion-title-wrap"><div class="accordion-title" style="font-size:.8em">${esc(item.タイトル)}</div><div class="accordion-meta">${esc(item.収集日||'')} ${item.情報源?`<a href="${esc(item.情報源)}" target="_blank" style="font-size:.85em">出典</a>`:''}</div></div></div><div class="accordion-body"><div class="acc-sec"><div class="acc-sec-label">最新</div><div class="acc-sec-text">${esc(item.最新||'')}</div></div>${(item.紐付き||[]).length?`<div class="acc-sec"><div class="acc-sec-label">紐付き</div><div class="links-list">${(item.紐付き||[]).map(l=>`<div class="link-item"><span class="link-arrow">\u2192</span><div class="link-content"><div class="link-target">${esc(l.カテゴリ)} / ${esc(l.サブ||'')}</div><div class="link-desc">${esc(l.内容||'')}</div></div></div>`).join('')}</div></div>`:''}</div></div>`).join('');

      sectorHtml+=`<div class="sector-box">
        <div class="sector-header"><span class="sector-name">${esc(sector)}</span><span class="sector-count">${matchingNews.length}件</span></div>
        <div class="tags" style="margin:6px 0">${topicChips}</div>
        ${sum?`<div class="summary-structured"><div class="summary-row"><span class="summary-label">情報</span><span class="summary-text">${esc(sum.情報)}</span></div><div class="summary-row"><span class="summary-label">背景</span><span class="summary-text">${esc(sum.背景)}</span></div><div class="summary-row"><span class="summary-label">見込</span><span class="summary-text">${esc(sum.見込み)}</span></div>${sum.ソース?`<div class="summary-source">出典: <a href="${esc(sum.ソースURL||'#')}" target="_blank">${esc(sum.ソース)}</a> (${esc(sum.取得日||'')})</div>`:''}</div>`:''}
        ${newsAccordions?`<div class="sector-news">${newsAccordions}</div>`:''}
      </div>`;
    }

    if(!sectorHtml)continue;
    html+=`<div class="domain-group"><div class="domain-header"><span class="domain-icon">${icon}</span><span class="domain-name">${esc(domain)}</span></div>${sectorHtml}</div>`;
  }

  document.getElementById('overview-categories').innerHTML=html||'<div style="text-align:center;padding:40px;color:var(--text3)">該当するカテゴリがありません</div>';
  document.querySelectorAll('#overview-categories .accordion-header').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
}

/* ===== MARKET ===== */
function renderMarket(){mkTable('market-stocks',marketData.株式指数||[]);mkTable('market-fx',marketData.為替||[]);mkTable('market-commodities',marketData.コモディティ||[]);mkTable('market-crypto',marketData.暗号資産||[])}
function mkTable(id,items){if(!items.length){document.getElementById(id).innerHTML='';return}const h='<tr><th>名称</th><th>値</th><th>前日比</th><th>変化率</th></tr>';const r=items.map(i=>{const d=i.変化率>0?'up':i.変化率<0?'down':'',a=i.変化率>0?'\u25B2':i.変化率<0?'\u25BC':'';return`<tr><td class="name-cell">${esc(i.名称)}</td><td class="num">${fmtN(i.値)}</td><td class="num ${d}">${i.前日比>0?'+':''}${fmtN(i.前日比)}</td><td class="num ${d}">${a}${i.変化率>0?'+':''}${i.変化率}%</td></tr>`}).join('');document.getElementById(id).innerHTML=`<table class="data-table"><thead>${h}</thead><tbody>${r}</tbody></table>`}

/* ===== INDICATORS ===== */
function renderIndicators(){
  const sources=indicatorData.公式ソース||[];
  document.getElementById('source-chips').innerHTML=sources.map(s=>`<a class="source-chip" href="${esc(s.URL)}" target="_blank"><span class="source-chip-dot"></span>${esc(s.名称)} - ${esc(s.対象)}</a>`).join('');
  const inds=indicatorData.指標||[];const cats=['全て',...new Set(inds.map(i=>i.カテゴリ))];
  document.getElementById('indicator-filters').innerHTML=cats.map(c=>`<button class="filter-btn ${c===activeIndFilter?'active':''}" data-f="${esc(c)}">${esc(c)}</button>`).join('');
  document.getElementById('indicator-filters').querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeIndFilter=b.dataset.f;renderIndicators()}));
  const fi=activeIndFilter==='全て'?inds:inds.filter(i=>i.カテゴリ===activeIndFilter);
  const rows=fi.map(i=>{const td=i.トレンド==='上昇'||i.トレンド==='上昇観測'?'up':i.トレンド==='下落'||i.トレンド==='減速'||i.トレンド==='鈍化'?'down':'flat';const src=i.URL?`<a href="${esc(i.URL)}" target="_blank" style="font-size:.75em">${esc(i.ソース||'出典')}</a>`:(i.ソース||'');return`<tr><td class="name-cell">${esc(i.名称)}</td><td class="num" style="font-weight:700">${esc(i.最新値)}</td><td class="num">${esc(i.前回)}</td><td><span class="trend-badge ${td}">${esc(i.トレンド)}</span></td><td>${esc(i.発表日)}</td><td>${esc(i.次回予定)}</td><td>${src}</td><td style="font-size:.72em;color:var(--text3)">${esc(i.備考||'')}</td></tr>`}).join('');
  document.getElementById('indicators-table').innerHTML=`<table class="data-table"><thead><tr><th>指標</th><th>最新値</th><th>前回</th><th>トレンド</th><th>発表日</th><th>次回</th><th>ソース</th><th>備考</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ===== EARNINGS ===== */
function renderEarnings(){
  // Company list table
  const searchEl=document.getElementById('company-search');
  if(!searchEl._bound){searchEl._bound=true;searchEl.addEventListener('input',ev=>{companyQuery=ev.target.value.trim().toLowerCase();renderCompanyTable()})}
  renderCompanyTable();

  // Schedule
  const sched=earningsData.決算スケジュール||[];
  const today=new Date('2026-04-11');
  document.getElementById('earnings-schedule').innerHTML=sched.map(s=>{const d=new Date(s.日付);const diff=Math.ceil((d-today)/864e5);const cls=diff<=7?'soon':'later';const label=diff<=0?'発表済み':diff+'日後';return`<div class="sched-row"><div class="sched-date">${esc(s.日付)}</div><div class="sched-name">${esc(s.企業)}</div><div class="sched-ticker">${esc(s.ティッカー)}</div><div class="sched-market">${esc(s.市場)}</div><div class="sched-countdown ${cls}">${label}</div></div>`}).join('');

  // Earnings data
  const list=earningsData.決算一覧||[];
  const sectors=['全て',...new Set(list.map(e=>e.セクター).filter(Boolean))];
  document.getElementById('earnings-filters').innerHTML=sectors.map(s=>`<button class="filter-btn ${s===activeEarnFilter?'active':''}" data-f="${esc(s)}">${esc(s)}</button>`).join('');
  document.getElementById('earnings-filters').querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeEarnFilter=b.dataset.f;renderEarnings()}));
  const fi=activeEarnFilter==='全て'?list:list.filter(e=>e.セクター===activeEarnFilter);
  document.getElementById('earnings-list').innerHTML=fi.map(e=>{
    const cells=[{l:'売上高',v:fmtEV(e.売上高),s:e.売上高?.前年比||''},{l:'営業利益',v:fmtEV(e.営業利益),s:e.営業利益?.前年比||''},{l:'純利益',v:fmtEV(e.純利益),s:e.純利益?.前年比||''},{l:'EPS',v:String(e.EPS?.値||'-'),s:'予想:'+String(e.EPS?.予想||'')}];
    const links=e.リンク||{};const linkHtml=Object.entries(links).filter(([,v])=>v).map(([k,v])=>`<a class="e-link" href="${esc(v)}" target="_blank">${esc(k)}</a>`).join('');
    const srcInfo=e.ソース?`<div class="acc-source" style="margin-top:6px">データソース: ${esc(e.ソース)} (${esc(e.取得日||'')})</div>`:'';
    return`<div class="accordion"><div class="accordion-header"><div class="accordion-arrow">\u25B6</div><div class="accordion-title-wrap"><div class="accordion-cat">${esc(e.ティッカー)} / ${esc(e.市場)} / ${esc(e.セクター||'')}</div><div class="accordion-title">${esc(e.企業名)} - ${esc(e.決算期)}</div><div class="accordion-meta">発表日: ${esc(e.発表日)}</div></div></div><div class="accordion-body"><div class="earnings-grid">${cells.map(c=>`<div class="e-cell"><div class="e-cell-label">${esc(c.l)}</div><div class="e-cell-val">${esc(c.v)}</div><div class="e-cell-sub">${esc(c.s)}</div></div>`).join('')}</div>${e.ガイダンス?`<div class="acc-sec"><div class="acc-sec-label">ガイダンス</div><div class="acc-sec-text">${esc(e.ガイダンス)}</div></div>`:''}${e.注目点?`<div class="e-note">\u{1F4CC} ${esc(e.注目点)}</div>`:''}${linkHtml?`<div class="e-links">${linkHtml}</div>`:''}${srcInfo}</div></div>`}).join('');
  bindAcc('earnings-list');
}

function renderCompanyTable(){
  const companies=(companyData.企業一覧||[]);
  let fi=companies;
  if(companyQuery)fi=fi.filter(c=>(c.企業名+c.コード+c.業種33).toLowerCase().includes(companyQuery));
  fi=fi.slice(0,100); // show max 100
  const rows=fi.map(c=>`<tr><td class="name-cell">${esc(c.コード?.slice(0,4))}</td><td class="name-cell">${esc(c.企業名)}</td><td>${esc(c.市場)}</td><td>${esc(c.業種33)}</td><td><a href="${esc(c.四季報)}" target="_blank" style="font-size:.75em">四季報</a></td><td><a href="${esc(c.EDINET)}" target="_blank" style="font-size:.75em">EDINET</a></td></tr>`).join('');
  document.getElementById('company-list-table').innerHTML=`<table class="data-table"><thead><tr><th>コード</th><th>企業名</th><th>市場</th><th>業種</th><th>四季報</th><th>EDINET</th></tr></thead><tbody>${rows}</tbody></table><div style="font-size:.7em;color:var(--text3);padding:8px 12px">全${companies.length}社中${fi.length}社表示${companyQuery?' (検索中)':''} | ソース: J-Quants API</div>`;
}

/* ===== POLICY ===== */
function renderPolicy(){
  const items=policyData['政策・レポート']||[];
  const types=['全て',...new Set(items.map(i=>i.種別))];
  document.getElementById('policy-filters').innerHTML=types.map(t=>`<button class="filter-btn ${t===activePolicyFilter?'active':''}" data-f="${esc(t)}">${esc(t)}</button>`).join('');
  document.getElementById('policy-filters').querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activePolicyFilter=b.dataset.f;renderPolicy()}));
  let fi=activePolicyFilter==='全て'?items:items.filter(i=>i.種別===activePolicyFilter);
  if(searchQuery)fi=fi.filter(i=>(i.タイトル+i.要約+i.発表元).toLowerCase().includes(searchQuery));
  document.getElementById('policy-list').innerHTML=fi.map(i=>{const bc=i.種別==='統計'?'stat':i.種別==='政策決定'||i.種別==='閣議決定'||i.種別==='決定'?'decision':i.種別==='レポート'?'report':'draft';const cats=(i.関連カテゴリ||[]).map(c=>`<span class="risk-tag">${ICONS[c]||''} ${esc(c)}</span>`).join('');return`<div class="accordion"><div class="accordion-header"><div class="accordion-arrow">\u25B6</div><div class="accordion-title-wrap"><div class="accordion-cat"><span class="policy-badge ${bc}">${esc(i.種別)}</span> ${esc(i.発表元)} (${esc(i.国)})</div><div class="accordion-title">${esc(i.タイトル)}</div><div class="accordion-meta">${esc(i.発表日)}</div></div></div><div class="accordion-body"><div class="acc-sec"><div class="acc-sec-text">${esc(i.要約)}</div></div>${cats?`<div class="policy-cats">${cats}</div>`:''}${i.URL?`<div class="acc-source"><a href="${esc(i.URL)}" target="_blank">${esc(i.URL)}</a></div>`:''}</div></div>`}).join('');
  bindAcc('policy-list');
}

/* ===== KNOWLEDGE ===== */
function renderKnowledge(){
  const topics=knowledgeData.トピック一覧||[];
  const cats=['全て',...new Set(topics.map(t=>t.カテゴリ))];
  document.getElementById('knowledge-filters').innerHTML=cats.map(c=>`<button class="filter-btn ${c===activeKnowledgeFilter?'active':''}" data-f="${esc(c)}">${esc(c)}</button>`).join('');
  document.getElementById('knowledge-filters').querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeKnowledgeFilter=b.dataset.f;renderKnowledge()}));
  let fi=activeKnowledgeFilter==='全て'?topics:topics.filter(t=>t.カテゴリ===activeKnowledgeFilter);
  if(searchQuery)fi=fi.filter(t=>(t.トピック+t.概要+(t.キーワード||[]).join('')).toLowerCase().includes(searchQuery));
  document.getElementById('knowledge-list').innerHTML=fi.map(t=>{const kw=(t.キーワード||[]).map(k=>`<span class="tag">${esc(k)}</span>`).join('');return`<div class="accordion"><div class="accordion-header"><div class="accordion-arrow">\u25B6</div><div class="accordion-title-wrap"><div class="accordion-cat">${esc(t.カテゴリ)}</div><div class="accordion-title">${esc(t.トピック)}</div></div></div><div class="accordion-body"><div class="acc-sec"><div class="acc-sec-text">${esc(t.概要)}</div></div>${kw?`<div class="tags" style="margin-top:8px">${kw}</div>`:''}</div></div>`}).join('')||'<div style="text-align:center;padding:40px;color:var(--text3)">データなし</div>';
  bindAcc('knowledge-list');
}

/* ===== Utils ===== */
function bindAcc(id){document.getElementById(id).querySelectorAll('.accordion-header').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')))}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmtN(n){return typeof n==='number'?n.toLocaleString('ja-JP',{maximumFractionDigits:2}):String(n)}
function fmtDate(iso){try{return new Date(iso).toLocaleString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return iso}}
function fmtEV(o){if(!o)return'-';const v=o.値;if(v>=1e6)return(v/1e6).toFixed(1)+'兆';if(v>=1e3)return(v/1e3).toFixed(1)+'B';return String(v)}

init();
