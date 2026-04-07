import { renderKnowledgeTab } from './html-renderer';
import type { KnowledgeBase } from '../types';

const EMPTY_KB: KnowledgeBase = {
  generatedAt: '2026-04-05T00:00:00.000Z',
  countryContexts: {},
  themeBackgrounds: [],
  economicHistory: [],
  timelines: [],
};

const SAMPLE_KB: KnowledgeBase = {
  generatedAt: '2026-04-05T00:00:00.000Z',
  countryContexts: {
    USA: {
      category: '国別コンテキスト',
      countryCode: 'USA',
      politicalSystem: '大統領制連邦共和国',
      economicStructure: 'サービス業中心の混合経済',
      historicalBackground: '1776年に独立宣言。',
      alliances: ['NATO', 'AUKUS', 'Five Eyes'],
      tensions: ['米中貿易戦争', '中東政策'],
      updatedAt: '2026-04-05',
    },
  },
  themeBackgrounds: [
    {
      category: 'テーマ別背景',
      themeId: 'nato-expansion',
      title: 'NATO拡大',
      summary: '冷戦後の東方拡大と集団安全保障',
      detail: '1949年設立。冷戦後、東欧諸国が加盟。',
      relatedCountries: ['USA', 'DEU', 'GBR'],
      tags: ['軍事', '同盟', '欧州'],
      updatedAt: '2026-04-05',
    },
  ],
  economicHistory: [
    {
      category: '経済史',
      eventId: 'lehman-2008',
      title: 'リーマンショック',
      period: '2008-09 〜 2009-06',
      summary: '米国発の世界金融危機',
      causes: ['サブプライムローン問題'],
      impacts: ['世界同時不況'],
      relatedCountries: ['USA', 'GBR', 'DEU'],
      timeline: [
        { date: '2008-09-15', title: 'リーマン・ブラザーズ破綻', description: '破産法申請' },
        { date: '2008-10-03', title: 'TARP成立', description: '7000億ドルの救済策' },
      ],
      updatedAt: '2026-04-05',
    },
  ],
  timelines: [
    {
      category: 'タイムライン',
      timelineId: 'ukraine-crisis',
      title: 'ウクライナ危機',
      summary: '2014年以降のウクライナ情勢',
      events: [
        { date: '2014-03', title: 'クリミア併合', description: 'ロシアがクリミアを併合' },
        { date: '2022-02-24', title: '全面侵攻', description: 'ロシアがウクライナに全面侵攻' },
      ],
      relatedCountries: ['UKR', 'RUS', 'USA'],
      updatedAt: '2026-04-05',
    },
  ],
};

describe('renderKnowledgeTab', () => {
  it('空のKnowledgeBaseのとき空メッセージを含むHTMLを返す', () => {
    const html = renderKnowledgeTab(EMPTY_KB);
    expect(html).toContain('背景知識データがありません');
  });

  it('国別コンテキストのセクションをレンダリングする', () => {
    const html = renderKnowledgeTab(SAMPLE_KB);
    expect(html).toContain('data-country="USA"');
    expect(html).toContain('大統領制連邦共和国');
    expect(html).toContain('NATO');
    expect(html).toContain('米中貿易戦争');
  });

  it('テーマ別背景をレンダリングする', () => {
    const html = renderKnowledgeTab(SAMPLE_KB);
    expect(html).toContain('NATO拡大');
    expect(html).toContain('冷戦後の東方拡大');
  });

  it('経済史をタイムライン付きでレンダリングする', () => {
    const html = renderKnowledgeTab(SAMPLE_KB);
    expect(html).toContain('リーマンショック');
    expect(html).toContain('2008-09-15');
    expect(html).toContain('TARP成立');
  });

  it('時事タイムラインをレンダリングする', () => {
    const html = renderKnowledgeTab(SAMPLE_KB);
    expect(html).toContain('ウクライナ危機');
    expect(html).toContain('クリミア併合');
    expect(html).toContain('2022-02-24');
  });

  it('HTMLエスケープが適用される', () => {
    const kb: KnowledgeBase = {
      ...EMPTY_KB,
      countryContexts: {
        TST: {
          category: '国別コンテキスト',
          countryCode: 'TST',
          politicalSystem: '<script>alert("xss")</script>',
          economicStructure: '安全',
          historicalBackground: '安全',
          alliances: [],
          tensions: [],
          updatedAt: '2026-04-05',
        },
      },
    };
    const html = renderKnowledgeTab(kb);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
