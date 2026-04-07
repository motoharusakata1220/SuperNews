import type { KnowledgeBase, CountryContext, ThemeBackground, EconomicHistoryEntry, CurrentEventsTimeline, TimelineEvent } from '../types';

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTags(tags: readonly string[]): string {
  return tags.map((t) => `<span class="kb-tag">${esc(t)}</span>`).join(' ');
}

function renderTimelineEvents(events: readonly TimelineEvent[]): string {
  if (events.length === 0) return '';
  const items = events.map((e) =>
    `<div class="kb-timeline-event"><span class="kb-tl-date">${esc(e.date)}</span><strong>${esc(e.title)}</strong><br><span class="kb-tl-desc">${esc(e.description)}</span></div>`
  ).join('');
  return `<div class="kb-timeline">${items}</div>`;
}

function renderCountrySection(code: string, ctx: CountryContext): string {
  const alliances = ctx.alliances.map((a) => esc(a)).join(', ') || 'なし';
  const tensions = ctx.tensions.map((t) => esc(t)).join(', ') || 'なし';

  return `<div class="kb-country-section" data-country="${esc(code)}">
<h3 class="kb-section-title">${esc(code)}</h3>
<div class="kb-field"><span class="kb-label">政治体制:</span> ${esc(ctx.politicalSystem)}</div>
<div class="kb-field"><span class="kb-label">経済構造:</span> ${esc(ctx.economicStructure)}</div>
<div class="kb-field"><span class="kb-label">同盟関係:</span> ${alliances}</div>
<div class="kb-field"><span class="kb-label">課題・対立:</span> ${tensions}</div>
<div class="kb-bg">${esc(ctx.historicalBackground)}</div>
</div>`;
}

function renderTheme(theme: ThemeBackground): string {
  const countries = theme.relatedCountries.map((c) => esc(c)).join(', ');
  return `<div class="kb-card" data-countries="${esc(theme.relatedCountries.join(','))}">
<h4>${esc(theme.title)}</h4>
<div class="kb-summary">${esc(theme.summary)}</div>
<div class="kb-detail">${esc(theme.detail)}</div>
<div class="kb-meta">関連国: ${countries} ${renderTags(theme.tags)}</div>
</div>`;
}

function renderEconomicHistory(entry: EconomicHistoryEntry): string {
  const causes = entry.causes.map((c) => `<li>${esc(c)}</li>`).join('');
  const impacts = entry.impacts.map((i) => `<li>${esc(i)}</li>`).join('');
  return `<div class="kb-card" data-countries="${esc(entry.relatedCountries.join(','))}">
<h4>${esc(entry.title)}<span class="kb-period">${esc(entry.period)}</span></h4>
<div class="kb-summary">${esc(entry.summary)}</div>
<div class="kb-causes"><strong>原因:</strong><ul>${causes}</ul></div>
<div class="kb-impacts"><strong>影響:</strong><ul>${impacts}</ul></div>
${renderTimelineEvents(entry.timeline)}
</div>`;
}

function renderTimeline(tl: CurrentEventsTimeline): string {
  return `<div class="kb-card" data-countries="${esc(tl.relatedCountries.join(','))}">
<h4>${esc(tl.title)}</h4>
<div class="kb-summary">${esc(tl.summary)}</div>
${renderTimelineEvents(tl.events)}
</div>`;
}

export function renderKnowledgeTab(kb: KnowledgeBase): string {
  const countryKeys = Object.keys(kb.countryContexts);
  const hasContent = countryKeys.length > 0
    || kb.themeBackgrounds.length > 0
    || kb.economicHistory.length > 0
    || kb.timelines.length > 0;

  if (!hasContent) {
    return '<div class="kb-empty">背景知識データがありません</div>';
  }

  const sections: string[] = [];

  if (countryKeys.length > 0) {
    const countries = countryKeys
      .map((code) => renderCountrySection(code, kb.countryContexts[code]))
      .join('');
    sections.push(`<div class="kb-group"><h3 class="kb-group-title">国別コンテキスト</h3>${countries}</div>`);
  }

  if (kb.themeBackgrounds.length > 0) {
    const themes = kb.themeBackgrounds.map(renderTheme).join('');
    sections.push(`<div class="kb-group"><h3 class="kb-group-title">テーマ別背景</h3>${themes}</div>`);
  }

  if (kb.economicHistory.length > 0) {
    const history = kb.economicHistory.map(renderEconomicHistory).join('');
    sections.push(`<div class="kb-group"><h3 class="kb-group-title">経済史</h3>${history}</div>`);
  }

  if (kb.timelines.length > 0) {
    const tls = kb.timelines.map(renderTimeline).join('');
    sections.push(`<div class="kb-group"><h3 class="kb-group-title">タイムライン</h3>${tls}</div>`);
  }

  return sections.join('');
}
