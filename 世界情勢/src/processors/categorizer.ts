import { RawArticle, NewsArticle, NewsCategory } from '../types';

interface CategoryRule {
  readonly category: NewsCategory;
  readonly keywords: readonly string[];
}

const RULES: readonly CategoryRule[] = [
  {
    category: '地域紛争',
    keywords: [
      'war', 'conflict', 'military', 'missile', 'attack', 'invasion', 'troops',
      'airstrike', 'ceasefire', 'combat', 'bombing',
      '紛争', '戦争', '軍事', 'ミサイル', '攻撃', '侵攻', '空爆', '停戦', '武装',
    ],
  },
  {
    category: '経済ニュース',
    keywords: [
      'gdp', 'economy', 'inflation', 'trade', 'market', 'stock', 'bond',
      'interest rate', 'central bank', 'recession', 'currency', 'tariff', 'export', 'import',
      '経済', '株価', '為替', '金利', '貿易', 'インフレ', 'デフレ', '景気', '市場', '財政',
      '中央銀行', '関税', '輸出', '輸入',
    ],
  },
  {
    category: 'テクノロジー',
    keywords: [
      'ai', 'artificial intelligence', 'tech', 'startup', 'cyber', 'software',
      'semiconductor', 'quantum', 'blockchain', 'robot',
      '半導体', 'テクノロジー', '人工知能', 'サイバー', 'ロボット', 'スタートアップ',
    ],
  },
  {
    category: '世界情勢',
    keywords: [
      'summit', 'diplomat', 'sanction', 'treaty', 'election', 'president',
      'prime minister', 'united nations', 'nato', 'g7', 'g20', 'bilateral',
      '外交', '首脳', '制裁', '条約', '選挙', '大統領', '首相', '国連', 'サミット',
    ],
  },
];

export function categorize(article: RawArticle): NewsCategory {
  const text = `${article.title} ${article.description}`.toLowerCase();

  for (const rule of RULES) {
    const matched = rule.keywords.some((kw) => text.includes(kw.toLowerCase()));
    if (matched) return rule.category;
  }

  return 'その他';
}

export function categorizeAll(articles: RawArticle[]): NewsArticle[] {
  return articles.map((article) => ({
    ...article,
    category: categorize(article),
  }));
}
