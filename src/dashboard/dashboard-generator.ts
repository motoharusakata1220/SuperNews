import { COUNTRY_INFO } from './map-data';

/** 国別の指標データ */
export interface IndicatorEntry {
  indicator: string;
  value: number | null;
  date: string;
  unit: string;
  source: string;
}

/** 国別データ */
export interface CountryData {
  countryCode: string;
  indicators: IndicatorEntry[];
}

/** 企業レポート概要 */
export interface CorporateReport {
  company: string;
  code: string;
  latestDate: string;
  documentCount: number;
}

/** 投資記事概要 */
export interface InvestmentArticle {
  title: string;
  date: string;
  url: string;
}

/** 世界情勢ニュース */
export interface WorldNewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
}

/** 背景知識の型（背景知識モジュールと同期） */
export interface KnowledgeBase {
  generatedAt: string;
  countryContexts: Record<string, {
    category: string;
    countryCode: string;
    politicalSystem: string;
    economicStructure: string;
    historicalBackground: string;
    alliances: readonly string[];
    tensions: readonly string[];
    updatedAt: string;
  }>;
  themeBackgrounds: readonly {
    category: string;
    themeId: string;
    title: string;
    summary: string;
    detail: string;
    relatedCountries: readonly string[];
    tags: readonly string[];
    updatedAt: string;
  }[];
  economicHistory: readonly {
    category: string;
    eventId: string;
    title: string;
    period: string;
    summary: string;
    causes: readonly string[];
    impacts: readonly string[];
    relatedCountries: readonly string[];
    timeline: readonly { date: string; title: string; description: string }[];
    updatedAt: string;
  }[];
  timelines: readonly {
    category: string;
    timelineId: string;
    title: string;
    summary: string;
    events: readonly { date: string; title: string; description: string }[];
    relatedCountries: readonly string[];
    updatedAt: string;
  }[];
}

/** ニュース間の関係性 */
export interface NewsRelationData {
  sourceId: string;
  targetId: string;
  relationType: string;
  description: string;
  confidence: number;
}

/** 国家間の関係性 */
export interface CountryRelationData {
  countryA: string;
  countryB: string;
  relationType: string;
  strength: number;
  context: string;
  sourceArticleIds: readonly string[];
}

/** ダッシュボード全体のデータ */
export interface DashboardData {
  generatedAt: string;
  countries: Record<string, CountryData>;
  corporateReports: CorporateReport[];
  investmentArticles: InvestmentArticle[];
  worldNews: WorldNewsItem[];
  knowledgeBase?: KnowledgeBase;
  newsRelations?: NewsRelationData[];
  countryRelations?: CountryRelationData[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderKnowledgeContent(kb?: KnowledgeBase): string {
  if (!kb) return '      <div class="kb-empty">背景知識データがありません</div>';

  const countryKeys = Object.keys(kb.countryContexts);
  const hasContent = countryKeys.length > 0 || kb.themeBackgrounds.length > 0
    || kb.economicHistory.length > 0 || kb.timelines.length > 0;
  if (!hasContent) return '      <div class="kb-empty">背景知識データがありません</div>';

  const parts: string[] = [];

  if (countryKeys.length > 0) {
    let html = '      <div class="kb-group"><h3 class="kb-group-title">国別コンテキスト</h3>';
    for (const code of countryKeys) {
      const ctx = kb.countryContexts[code];
      const alliances = ctx.alliances.map(escapeHtml).join(', ') || 'なし';
      const tensions = ctx.tensions.map(escapeHtml).join(', ') || 'なし';
      html += `<div class="kb-country-section" data-country="${escapeHtml(code)}">`;
      html += `<h3 class="kb-section-title">${escapeHtml(code)}</h3>`;
      html += `<div class="kb-field"><span class="kb-label">政治体制:</span> ${escapeHtml(ctx.politicalSystem)}</div>`;
      html += `<div class="kb-field"><span class="kb-label">経済構造:</span> ${escapeHtml(ctx.economicStructure)}</div>`;
      html += `<div class="kb-field"><span class="kb-label">同盟関係:</span> ${alliances}</div>`;
      html += `<div class="kb-field"><span class="kb-label">課題・対立:</span> ${tensions}</div>`;
      html += `<div class="kb-bg">${escapeHtml(ctx.historicalBackground)}</div></div>`;
    }
    html += '</div>';
    parts.push(html);
  }

  if (kb.themeBackgrounds.length > 0) {
    let html = '      <div class="kb-group"><h3 class="kb-group-title">テーマ別背景</h3>';
    for (const t of kb.themeBackgrounds) {
      html += `<div class="kb-card" data-countries="${t.relatedCountries.join(',')}">`;
      html += `<h4>${escapeHtml(t.title)}</h4>`;
      html += `<div class="kb-summary">${escapeHtml(t.summary)}</div>`;
      html += `<div class="kb-detail">${escapeHtml(t.detail)}</div>`;
      html += `<div class="kb-meta">関連国: ${t.relatedCountries.map(escapeHtml).join(', ')} `;
      html += t.tags.map(tag => `<span class="kb-tag">${escapeHtml(tag)}</span>`).join(' ');
      html += '</div></div>';
    }
    html += '</div>';
    parts.push(html);
  }

  if (kb.economicHistory.length > 0) {
    let html = '      <div class="kb-group"><h3 class="kb-group-title">経済史</h3>';
    for (const e of kb.economicHistory) {
      html += `<div class="kb-card" data-countries="${e.relatedCountries.join(',')}">`;
      html += `<h4>${escapeHtml(e.title)}<span class="kb-period">${escapeHtml(e.period)}</span></h4>`;
      html += `<div class="kb-summary">${escapeHtml(e.summary)}</div>`;
      html += '<div class="kb-causes"><strong>原因:</strong><ul>';
      html += e.causes.map(c => `<li>${escapeHtml(c)}</li>`).join('');
      html += '</ul></div><div class="kb-impacts"><strong>影響:</strong><ul>';
      html += e.impacts.map(i => `<li>${escapeHtml(i)}</li>`).join('');
      html += '</ul></div>';
      if (e.timeline.length > 0) {
        html += '<div class="kb-timeline">';
        for (const ev of e.timeline) {
          html += `<div class="kb-timeline-event"><span class="kb-tl-date">${escapeHtml(ev.date)}</span>`;
          html += `<strong>${escapeHtml(ev.title)}</strong><br>`;
          html += `<span class="kb-tl-desc">${escapeHtml(ev.description)}</span></div>`;
        }
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    parts.push(html);
  }

  if (kb.timelines.length > 0) {
    let html = '      <div class="kb-group"><h3 class="kb-group-title">タイムライン</h3>';
    for (const tl of kb.timelines) {
      html += `<div class="kb-card" data-countries="${tl.relatedCountries.join(',')}">`;
      html += `<h4>${escapeHtml(tl.title)}</h4>`;
      html += `<div class="kb-summary">${escapeHtml(tl.summary)}</div>`;
      html += '<div class="kb-timeline">';
      for (const ev of tl.events) {
        html += `<div class="kb-timeline-event"><span class="kb-tl-date">${escapeHtml(ev.date)}</span>`;
        html += `<strong>${escapeHtml(ev.title)}</strong><br>`;
        html += `<span class="kb-tl-desc">${escapeHtml(ev.description)}</span></div>`;
      }
      html += '</div></div>';
    }
    html += '</div>';
    parts.push(html);
  }

  return parts.join('\n');
}

/** 関係性タブの色マップ */
const RELATION_TYPE_COLORS: Record<string, string> = {
  '同盟': '#4a9eff',
  '対立': '#ff4a4a',
  '貿易': '#4aff8a',
  '制裁': '#ff8a4a',
  '外交': '#8a8aff',
  '紛争': '#ff4a7a',
};

/** 国家間関係コンテンツをレンダリングする */
function renderRelationsContent(data: DashboardData): string {
  const countryRels = data.countryRelations || [];
  const newsRels = data.newsRelations || [];

  if (countryRels.length === 0 && newsRels.length === 0) {
    return '      <div class="rel-empty">関係性データがありません</div>';
  }

  const parts: string[] = [];

  if (countryRels.length > 0) {
    let html = '      <div class="rel-group"><h3 class="rel-group-title">国家間の関係</h3>';
    for (const rel of countryRels) {
      const color = RELATION_TYPE_COLORS[rel.relationType] || '#8a8aff';
      const strengthLabel = rel.strength > 0 ? '友好' : rel.strength < 0 ? '敵対' : '中立';
      const strengthBar = Math.abs(rel.strength) * 100;
      html += `<div class="rel-card">`;
      html += `<div class="rel-pair">`;
      html += `<span class="rel-country">${escapeHtml(rel.countryA)}</span>`;
      html += `<span class="rel-arrow" style="color:${color}">⟷</span>`;
      html += `<span class="rel-country">${escapeHtml(rel.countryB)}</span>`;
      html += `</div>`;
      html += `<div class="rel-type" style="background:${color}20;color:${color}">${escapeHtml(rel.relationType)}</div>`;
      html += `<div class="rel-strength"><span class="rel-strength-label">${strengthLabel}</span>`;
      html += `<div class="rel-strength-bar"><div class="rel-strength-fill" style="width:${strengthBar}%;background:${color}"></div></div></div>`;
      html += `<div class="rel-context">${escapeHtml(rel.context)}</div>`;
      html += `</div>`;
    }
    html += '</div>';
    parts.push(html);
  }

  if (newsRels.length > 0) {
    let html = '      <div class="rel-group"><h3 class="rel-group-title">ニュース間の関係</h3>';
    // ニュースIDからタイトルへのマップ
    const idToTitle = new Map<string, string>();
    for (const n of data.worldNews) {
      idToTitle.set(n.url, n.title);
    }
    for (const rel of newsRels) {
      const typeColors: Record<string, string> = {
        '因果関係': '#ffaa4a', '関連': '#4a9eff', '対立': '#ff4a4a', '連鎖': '#4aff8a', '背景': '#8a8aff',
      };
      const color = typeColors[rel.relationType] || '#8a8aff';
      html += `<div class="rel-card">`;
      html += `<div class="rel-type" style="background:${color}20;color:${color}">${escapeHtml(rel.relationType)}</div>`;
      html += `<div class="rel-news-pair">`;
      html += `<div class="rel-news-item">${escapeHtml(rel.sourceId)}</div>`;
      html += `<div class="rel-news-arrow">→</div>`;
      html += `<div class="rel-news-item">${escapeHtml(rel.targetId)}</div>`;
      html += `</div>`;
      html += `<div class="rel-desc">${escapeHtml(rel.description)}</div>`;
      html += `<div class="rel-confidence">確信度: ${(rel.confidence * 100).toFixed(0)}%</div>`;
      html += `</div>`;
    }
    html += '</div>';
    parts.push(html);
  }

  return parts.join('\n');
}

/** ダッシュボードHTMLを生成する */
export function buildDashboardHtml(data: DashboardData): string {
  const countryInfoJson = JSON.stringify(COUNTRY_INFO);
  const dashboardDataJson = JSON.stringify(data);

  const kbCountries = data.knowledgeBase ? Object.keys(data.knowledgeBase.countryContexts).length : 0;
  const kbThemes = data.knowledgeBase ? data.knowledgeBase.themeBackgrounds.length : 0;
  const kbHistory = data.knowledgeBase ? data.knowledgeBase.economicHistory.length : 0;
  const kbTimelines = data.knowledgeBase ? data.knowledgeBase.timelines.length : 0;
  const kbTotal = kbCountries + kbThemes + kbHistory + kbTimelines;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SuperNews</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://d3js.org/d3.v7.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3"><\/script>
<style>
:root {
  --bg-primary: #06090f;
  --bg-secondary: #0c1220;
  --bg-card: #111a2e;
  --bg-card-hover: #162040;
  --border: #1c2844;
  --border-light: #243352;
  --text-primary: #e8edf5;
  --text-secondary: #94a3b8;
  --text-muted: #5a6a80;
  --accent: #3b82f6;
  --accent-light: #60a5fa;
  --accent-glow: rgba(59, 130, 246, 0.15);
  --green: #22c55e;
  --red: #ef4444;
  --orange: #f59e0b;
  --purple: #a78bfa;
  --radius: 10px;
  --radius-sm: 6px;
  --font: 'Inter', 'Noto Sans JP', -apple-system, sans-serif;
}
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 14px; }
body { font-family: var(--font); background: var(--bg-primary); color: var(--text-primary); line-height: 1.5; overflow: hidden; height: 100vh; }

/* === HEADER === */
.header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  padding: 0 24px;
  height: 52px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
  position: relative; z-index: 10;
}
.header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.3; }
.header h1 { font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
.header h1 span { color: var(--accent-light); }
.header .meta { font-size: 11px; color: var(--text-muted); }

/* === SUMMARY BAR === */
.summary-bar {
  display: flex; gap: 6px; padding: 10px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  overflow-x: auto; flex-shrink: 0;
}
.summary-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 14px;
  display: flex; align-items: center; gap: 10px;
  white-space: nowrap;
  transition: border-color 0.2s;
}
.summary-item:hover { border-color: var(--border-light); }
.summary-item .val { font-size: 18px; font-weight: 700; color: var(--accent-light); line-height: 1; }
.summary-item .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* === MAIN LAYOUT === */
.main { display: flex; height: calc(100vh - 52px - 48px); }
.map-panel { flex: 1; min-width: 0; position: relative; background: var(--bg-primary); }
#world-map { width: 100%; height: 100%; }

/* === SIDE PANEL === */
.side-panel {
  width: 460px; background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.country-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent-glow), transparent);
}
.country-header h2 { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.country-header .region { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.no-selection { padding: 60px 20px; text-align: center; color: var(--text-muted); font-size: 13px; line-height: 1.8; }

/* === TABS === */
.tabs {
  display: flex; border-bottom: 1px solid var(--border);
  flex-shrink: 0; background: var(--bg-secondary);
  overflow-x: auto;
}
.tab {
  flex: 0 0 auto; padding: 10px 14px;
  text-align: center; cursor: pointer;
  font-size: 11px; font-weight: 500;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}
.tab:hover { color: var(--text-secondary); background: rgba(255,255,255,0.02); }
.tab.active { color: var(--accent-light); border-bottom-color: var(--accent); }
.tab .badge {
  display: inline-block;
  background: var(--accent-glow);
  color: var(--accent-light);
  font-size: 9px; font-weight: 700;
  padding: 1px 5px; border-radius: 8px;
  margin-left: 4px;
}
.tab-content { display: none; padding: 16px 20px; flex: 1; overflow-y: auto; }
.tab-content.active { display: block; }
.tab-content::-webkit-scrollbar { width: 4px; }
.tab-content::-webkit-scrollbar-track { background: transparent; }
.tab-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* === CARDS (shared) === */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 8px;
  transition: border-color 0.2s, background 0.2s;
}
.card:hover { border-color: var(--border-light); background: var(--bg-card-hover); }

/* === INDICATOR CARDS === */
.indicator-group-title {
  font-size: 10px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 1px;
  margin: 14px 0 8px; padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.indicator-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.indicator-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; transition: border-color 0.2s; }
.indicator-card:hover { border-color: var(--border-light); }
.indicator-card .name { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.indicator-card .value { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.5px; }
.indicator-card .detail { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

/* === CORPORATE === */
.corp-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px; margin-bottom: 8px; transition: border-color 0.2s;
  display: flex; align-items: center; gap: 14px;
}
.corp-card:hover { border-color: var(--border-light); }
.corp-icon {
  width: 40px; height: 40px; border-radius: 8px;
  background: var(--accent-glow); border: 1px solid var(--border-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: var(--accent-light);
  flex-shrink: 0;
}
.corp-info { flex: 1; min-width: 0; }
.corp-info .company { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.corp-info .code { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.corp-info .docs { font-size: 11px; color: var(--green); margin-top: 2px; }

/* === INVEST / NEWS === */
.news-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px; margin-bottom: 8px; transition: border-color 0.2s;
}
.news-card:hover { border-color: var(--accent); }
.news-card .title { font-size: 13px; font-weight: 500; color: var(--text-primary); line-height: 1.5; }
.news-card .title a { color: var(--text-primary); text-decoration: none; }
.news-card .title a:hover { color: var(--accent-light); }
.news-card .desc { font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-card .meta-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
.news-card .meta-row .tag {
  font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 4px;
  background: var(--accent-glow); color: var(--accent-light);
}
.news-card .meta-row .date { font-size: 11px; color: var(--text-muted); }
.news-card .meta-row .source { font-size: 11px; color: var(--text-muted); }

/* === KNOWLEDGE === */
.kb-group { margin-bottom: 20px; }
.kb-group-title {
  font-size: 11px; font-weight: 600; color: var(--accent-light);
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.kb-country-section {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px; margin-bottom: 8px; transition: border-color 0.2s;
}
.kb-country-section:hover { border-color: var(--border-light); }
.kb-section-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; }
.kb-field { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.5; }
.kb-label { color: var(--text-muted); font-weight: 500; }
.kb-bg { font-size: 12px; color: var(--text-muted); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); line-height: 1.7; }
.kb-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px; margin-bottom: 8px; transition: border-color 0.2s;
}
.kb-card:hover { border-color: var(--border-light); }
.kb-card h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.kb-period { font-size: 11px; color: var(--text-muted); margin-left: 8px; font-weight: 400; }
.kb-summary { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.6; }
.kb-detail { font-size: 12px; color: var(--text-muted); line-height: 1.7; margin-bottom: 8px; }
.kb-meta { font-size: 11px; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.kb-tag { background: var(--accent-glow); color: var(--accent-light); border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 500; }
.kb-causes, .kb-impacts { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.kb-causes ul, .kb-impacts ul { margin: 4px 0 0 18px; }
.kb-causes li, .kb-impacts li { margin-bottom: 2px; }
.kb-timeline { border-left: 2px solid var(--accent); margin: 12px 0 0 6px; padding-left: 16px; }
.kb-timeline-event { margin-bottom: 12px; position: relative; }
.kb-timeline-event::before {
  content: ''; position: absolute; left: -21px; top: 5px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); border: 2px solid var(--bg-card);
}
.kb-tl-date { font-size: 10px; color: var(--accent-light); font-weight: 600; display: block; margin-bottom: 2px; }
.kb-tl-desc { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.kb-empty { padding: 40px 16px; text-align: center; color: var(--text-muted); font-size: 13px; }

/* === RELATIONS === */
.rel-empty { padding: 40px 16px; text-align: center; color: var(--text-muted); font-size: 13px; }
.rel-group { margin-bottom: 20px; }
.rel-group-title { font-size: 11px; font-weight: 600; color: var(--accent-light); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
.rel-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 8px; }
.rel-pair { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.rel-country { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.rel-arrow { font-size: 16px; }
.rel-type { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 4px; margin-bottom: 8px; }
.rel-strength { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.rel-strength-label { font-size: 11px; color: var(--text-muted); min-width: 28px; }
.rel-strength-bar { flex: 1; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
.rel-strength-fill { height: 100%; border-radius: 2px; }
.rel-context { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
.rel-news-pair { display: flex; align-items: flex-start; gap: 8px; margin: 8px 0; }
.rel-news-item { flex: 1; font-size: 12px; color: var(--text-secondary); background: var(--bg-primary); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); }
.rel-news-arrow { color: var(--text-muted); font-size: 14px; padding-top: 8px; }
.rel-desc { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.rel-confidence { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

/* === MAP === */
svg .relation-arc { fill: none; stroke-width: 1.5; opacity: 0.5; pointer-events: none; }
svg .relation-arc:hover { opacity: 1; stroke-width: 2.5; }
svg .country { fill: #0f1b2d; stroke: #1a2d4a; stroke-width: 0.5; transition: fill 0.25s; }
svg .country.target { fill: #132744; cursor: pointer; }
svg .country.target:hover { fill: #1a3a6a; }
svg .country.selected { fill: #2563eb; filter: drop-shadow(0 0 8px rgba(37,99,235,0.4)); }
svg .country-label { font-size: 9px; fill: var(--accent-light); pointer-events: none; text-anchor: middle; font-weight: 600; opacity: 0.9; }

/* === LEGEND === */
.legend {
  position: absolute; bottom: 16px; left: 16px;
  background: rgba(6,9,15,0.92); backdrop-filter: blur(8px);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 12px 16px; font-size: 11px;
}
.legend-item { display: flex; align-items: center; margin-bottom: 3px; color: var(--text-secondary); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
.legend-sep { border-top: 1px solid var(--border); margin: 6px 0 4px; padding-top: 4px; font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .side-panel { width: 380px; }
}
@media (max-width: 900px) {
  body { overflow: auto; height: auto; }
  .main { flex-direction: column; height: auto; }
  .map-panel { height: 45vh; }
  .side-panel { width: 100%; height: auto; min-height: 50vh; }
  .summary-bar { padding: 8px 12px; }
}
</style>
</head>
<body>
<div class="header">
  <h1><span>Super</span>News</h1>
  <div class="meta">${escapeHtml(data.generatedAt.slice(0, 10))}</div>
</div>
<div class="summary-bar">
  <div class="summary-item"><span class="val">${Object.keys(data.countries).length}</span><span class="label">Countries</span></div>
  <div class="summary-item"><span class="val">${Object.values(data.countries).reduce((s, c) => s + c.indicators.length, 0)}</span><span class="label">Indicators</span></div>
  <div class="summary-item"><span class="val">${data.corporateReports.length}</span><span class="label">Reports</span></div>
  <div class="summary-item"><span class="val">${data.investmentArticles.length}</span><span class="label">Articles</span></div>
  <div class="summary-item"><span class="val">${data.worldNews.length}</span><span class="label">News</span></div>
  <div class="summary-item"><span class="val">${kbTotal}</span><span class="label">Knowledge</span></div>
</div>
<div class="main">
  <div class="map-panel">
    <svg id="world-map"></svg>
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#2563eb"></div>選択中</div>
      <div class="legend-item"><div class="legend-dot" style="background:#132744"></div>データあり</div>
      <div class="legend-item"><div class="legend-dot" style="background:#0f1b2d"></div>データなし</div>
      <div class="legend-sep">関係性</div>
      <div class="legend-item"><div class="legend-dot" style="background:#4a9eff"></div>同盟</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff4a4a"></div>対立</div>
      <div class="legend-item"><div class="legend-dot" style="background:#4aff8a"></div>貿易</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff8a4a"></div>制裁</div>
    </div>
  </div>
  <div class="side-panel">
    <div id="country-header" class="country-header" style="display:none">
      <h2 id="country-name"></h2>
      <div id="country-region" class="region"></div>
    </div>
    <div id="no-selection" class="no-selection">
      地図上の国をクリックして<br>経済指標を表示
    </div>
    <div class="tabs">
      <div class="tab active" data-tab="indicators">経済指標</div>
      <div class="tab" data-tab="corporate">企業<span class="badge">${data.corporateReports.length}</span></div>
      <div class="tab" data-tab="investment">投資<span class="badge">${data.investmentArticles.length}</span></div>
      <div class="tab" data-tab="worldnews">世界情勢<span class="badge">${data.worldNews.length}</span></div>
      <div class="tab" data-tab="knowledge">背景知識<span class="badge">${kbTotal}</span></div>
      <div class="tab" data-tab="relations">関係性</div>
    </div>
    <div id="tab-indicators" class="tab-content active"></div>
    <div id="tab-corporate" class="tab-content">
${data.corporateReports.map(r => `      <div class="corp-card">
        <div class="corp-icon">${escapeHtml(r.code.slice(0, 2))}</div>
        <div class="corp-info">
          <div class="company">${escapeHtml(r.company)}</div>
          <div class="code">${escapeHtml(r.code)}</div>
          <div class="docs">${r.documentCount}件の書類 / 最新: ${escapeHtml(r.latestDate)}</div>
        </div>
      </div>`).join('\n')}
${data.corporateReports.length === 0 ? '      <div class="no-selection">企業情報データなし</div>' : ''}
    </div>
    <div id="tab-investment" class="tab-content">
${data.investmentArticles.map(a => `      <div class="news-card">
        <div class="title"><a href="${escapeHtml(a.url)}" target="_blank">${escapeHtml(a.title)}</a></div>
        <div class="meta-row"><span class="date">${escapeHtml(a.date)}</span></div>
      </div>`).join('\n')}
${data.investmentArticles.length === 0 ? '      <div class="no-selection">投資記事データなし</div>' : ''}
    </div>
    <div id="tab-worldnews" class="tab-content">
${data.worldNews.map(n => `      <div class="news-card">
        <div class="title"><a href="${escapeHtml(n.url)}" target="_blank">${escapeHtml(n.title)}</a></div>
        <div class="desc">${escapeHtml(n.description)}</div>
        <div class="meta-row">
          <span class="tag">${escapeHtml(n.category)}</span>
          <span class="source">${escapeHtml(n.source)}</span>
          <span class="date">${escapeHtml(n.publishedAt.slice(0, 10))}</span>
        </div>
      </div>`).join('\n')}
${data.worldNews.length === 0 ? '      <div class="no-selection">世界情勢データなし</div>' : ''}
    </div>
    <div id="tab-knowledge" class="tab-content">
${renderKnowledgeContent(data.knowledgeBase)}
    </div>
    <div id="tab-relations" class="tab-content">
${renderRelationsContent(data)}
    </div>
  </div>
</div>
<script>
const COUNTRY_INFO = ${countryInfoJson};
const DASHBOARD = ${dashboardDataJson};

const TARGET_CODES_3 = Object.keys(COUNTRY_INFO);
const ALPHA3_TO_ALPHA2 = {};
const ALPHA2_TO_ALPHA3 = {};
for (const [a3, info] of Object.entries(COUNTRY_INFO)) {
  ALPHA3_TO_ALPHA2[a3] = info.alpha2;
  ALPHA2_TO_ALPHA3[info.alpha2] = a3;
}

// world-atlas countries-110m.json uses ISO 3166-1 numeric IDs
const NUMERIC_TO_ALPHA3 = {
  '840':'USA','392':'JPN','276':'DEU','826':'GBR','250':'FRA',
  '156':'CHN','356':'IND','076':'BRA','410':'KOR','036':'AUS',
  '124':'CAN','380':'ITA','484':'MEX','360':'IDN','792':'TUR'
};

function toAlpha3(id) {
  if (COUNTRY_INFO[id]) return id;
  if (ALPHA2_TO_ALPHA3[id]) return ALPHA2_TO_ALPHA3[id];
  if (NUMERIC_TO_ALPHA3[String(id)]) return NUMERIC_TO_ALPHA3[String(id)];
  return id;
}

function isTargetCountry(id) {
  return !!COUNTRY_INFO[toAlpha3(id)];
}

// --- タブ切り替え ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// --- 数値フォーマット ---
function fmtValue(val, unit) {
  if (val === null || val === undefined) return 'N/A';
  if (unit === 'USドル' || unit === '百万USドル') {
    if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(2) + '兆USD';
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + '億USD';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + '百万USD';
    return val.toLocaleString() + ' USD';
  }
  if (unit === '人') {
    if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + '0億人';
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + '万人';
    return val.toLocaleString() + '人';
  }
  if (unit === '%') return val.toFixed(1) + '%';
  return val.toLocaleString() + ' ' + unit;
}

// --- 国選択時の指標表示 ---
let selectedCode = null;

function selectCountry(alpha3) {
  selectedCode = alpha3;
  const info = COUNTRY_INFO[alpha3];
  if (!info) return;

  document.getElementById('no-selection').style.display = 'none';
  const header = document.getElementById('country-header');
  header.style.display = 'block';
  document.getElementById('country-name').textContent = info.nameJa + ' (' + alpha3 + ')';
  document.getElementById('country-region').textContent = info.region;

  // ハイライト更新
  d3.selectAll('.country').classed('selected', false);
  d3.selectAll('.country').each(function(d) {
    const id = d && d.properties ? (d.properties.ISO_A3 || d.properties.iso_a3 || d.id) : '';
    if (toAlpha3(id) === alpha3) d3.select(this).classed('selected', true);
  });

  // 指標タブ
  const panel = document.getElementById('tab-indicators');
  const cd = DASHBOARD.countries[alpha3];
  if (!cd || cd.indicators.length === 0) {
    panel.innerHTML = '<div class="no-selection">この国の経済指標データはまだありません</div>';
    return;
  }

  // カテゴリ分類
  const categories = {};
  cd.indicators.forEach(ind => {
    const cat = categorize(ind.indicator);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(ind);
  });

  let html = '';
  for (const [cat, inds] of Object.entries(categories)) {
    html += '<div class="indicator-group-title">' + cat + '</div>';
    html += '<div class="indicator-grid">';
    inds.forEach(ind => {
      html += '<div class="indicator-card">';
      html += '<div class="name">' + ind.indicator + '</div>';
      html += '<div class="value">' + fmtValue(ind.value, ind.unit) + '</div>';
      html += '<div class="detail">' + ind.date + ' / ' + ind.source + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  panel.innerHTML = html;

  // 経済指標タブをアクティブに
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelector('[data-tab="indicators"]').classList.add('active');
  document.getElementById('tab-indicators').classList.add('active');
}

function categorize(name) {
  if (/GDP|成長率|インフレ|経常|債務|歳入|輸出|輸入/.test(name)) return 'マクロ経済';
  if (/失業|雇用|労働|就業|NEET|賃金|自営/.test(name)) return '雇用・労働';
  if (/人口|寿命|出生|都市/.test(name)) return '人口・社会';
  if (/エネルギー|CO2|再生可能|温室|排出/.test(name)) return 'エネルギー・環境';
  if (/貿易|FDI|送金|関税|輸出額|輸入額/.test(name)) return '貿易・投資';
  if (/金利|マネー|信用|為替/.test(name)) return '金融';
  if (/医療|健康|死亡|肥満|喫煙|アルコール|自殺|衛生|医師|看護|ヘルス/.test(name)) return '健康・医療';
  if (/教育|識字|高等/.test(name)) return '教育';
  if (/ジニ|貧困|所得|満足|幸福|安全|投票|水質/.test(name)) return '幸福度・格差';
  if (/食料|穀物|農/.test(name)) return '食料・農業';
  return 'その他';
}

// --- 世界地図描画 ---
const svg = d3.select('#world-map');
const container = svg.node().parentElement;

function render() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  svg.attr('viewBox', '0 0 ' + w + ' ' + h);

  const projection = d3.geoNaturalEarth1()
    .fitSize([w - 20, h - 20], { type: 'Sphere' })
    .translate([w / 2, h / 2]);
  const path = d3.geoPath().projection(projection);

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
    const countries = topojson.feature(world, world.objects.countries);

    svg.selectAll('*').remove();
    svg.append('g').selectAll('path')
      .data(countries.features)
      .enter().append('path')
      .attr('d', path)
      .attr('class', d => {
        const id = d.id || d.properties.ISO_A3 || '';
        const a3 = toAlpha3(id);
        let cls = 'country';
        if (isTargetCountry(id) || DASHBOARD.countries[a3]) cls += ' target';
        if (a3 === selectedCode) cls += ' selected';
        return cls;
      })
      .on('click', (event, d) => {
        const id = d.id || d.properties.ISO_A3 || '';
        const a3 = toAlpha3(id);
        if (COUNTRY_INFO[a3]) selectCountry(a3);
      });

    // 国ラベル
    const targetFeatures = countries.features.filter(d => {
      const id = d.id || d.properties.ISO_A3 || '';
      return isTargetCountry(id) || DASHBOARD.countries[toAlpha3(id)];
    });

    // ラベルは COUNTRY_INFO の座標を使う（centroidより正確）
    for (const [a3, info] of Object.entries(COUNTRY_INFO)) {
      const pt = projection([info.lng, info.lat]);
      if (pt) {
        svg.append('text')
          .attr('class', 'country-label')
          .attr('x', pt[0])
          .attr('y', pt[1])
          .text(info.nameJa);
      }
    }

    // --- 国家間関係アーク描画 ---
    const REL_COLORS = {
      '同盟': '#4a9eff', '対立': '#ff4a4a', '貿易': '#4aff8a',
      '制裁': '#ff8a4a', '外交': '#8a8aff', '紛争': '#ff4a7a'
    };
    const countryRelations = DASHBOARD.countryRelations || [];
    const arcGroup = svg.append('g').attr('class', 'relation-arcs');

    countryRelations.forEach(function(rel) {
      const infoA = COUNTRY_INFO[rel.countryA];
      const infoB = COUNTRY_INFO[rel.countryB];
      if (!infoA || !infoB) return;

      const ptA = projection([infoA.lng, infoA.lat]);
      const ptB = projection([infoB.lng, infoB.lat]);
      if (!ptA || !ptB) return;

      // 曲線の中間点を計算（上方向にカーブ）
      const midX = (ptA[0] + ptB[0]) / 2;
      const midY = (ptA[1] + ptB[1]) / 2;
      const dx = ptB[0] - ptA[0];
      const dy = ptB[1] - ptA[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(dist * 0.3, 80);
      const cx = midX - (dy / dist) * curvature;
      const cy = midY + (dx / dist) * curvature;

      const color = REL_COLORS[rel.relationType] || '#8a8aff';
      const strokeWidth = 1 + Math.abs(rel.strength) * 2;

      const arcPath = 'M ' + ptA[0] + ',' + ptA[1]
        + ' Q ' + cx + ',' + cy
        + ' ' + ptB[0] + ',' + ptB[1];

      arcGroup.append('path')
        .attr('class', 'relation-arc')
        .attr('d', arcPath)
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', rel.strength < 0 ? '6,3' : 'none')
        .append('title')
        .text(rel.countryA + ' ⟷ ' + rel.countryB + ' (' + rel.relationType + ')');
    });
  });
}

render();
window.addEventListener('resize', render);
<\/script>
</body>
</html>`;
}
