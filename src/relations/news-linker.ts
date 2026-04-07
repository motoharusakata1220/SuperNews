import { NewsArticleWithId, NewsRelation, NewsRelationType } from './types';

/** キーワード抽出用の重要語リスト */
const COUNTRY_KEYWORDS = [
  'アメリカ', '米国', 'USA', 'United States',
  '日本', 'Japan',
  'ドイツ', 'Germany',
  'イギリス', '英国', 'UK', 'Britain',
  'フランス', 'France',
  '中国', 'China',
  'インド', 'India',
  'ブラジル', 'Brazil',
  '韓国', 'South Korea', 'Korea',
  'オーストラリア', 'Australia',
  'カナダ', 'Canada',
  'イタリア', 'Italy',
  'メキシコ', 'Mexico',
  'インドネシア', 'Indonesia',
  'トルコ', 'Turkey', 'Türkiye',
  'ウクライナ', 'Ukraine',
  'ロシア', 'Russia',
  '台湾', 'Taiwan',
  'イラン', 'Iran',
  'サウジアラビア', 'Saudi Arabia',
  '北朝鮮', 'North Korea',
  'EU', 'NATO', 'BRICS', 'ASEAN', 'OPEC',
];

const TOPIC_KEYWORDS = [
  '原油', '石油', 'oil',
  '関税', 'tariff',
  '金利', 'interest rate',
  'インフレ', 'inflation',
  'GDP',
  '貿易', 'trade',
  '制裁', 'sanction',
  '停戦', 'ceasefire',
  '選挙', 'election',
  '防衛', 'defense', 'defence',
  '軍事', 'military',
  '気候', 'climate',
  '半導体', 'semiconductor',
  'AI', '人工知能',
  '移民', 'immigration',
  '難民', 'refugee',
  '核', 'nuclear',
  '減産', '増産',
];

const CAUSAL_KEYWORDS = ['受けて', 'を受け', 'に伴い', 'の影響', 'の結果', 'により', 'をきっかけ', 'caused by', 'due to', 'as a result', 'following'];
const CONFLICT_KEYWORDS = ['対立', '紛争', '戦争', '報復', '対抗', '摩擦', '衝突', '制裁', 'conflict', 'war', 'retaliation', 'tension', 'sanction', 'dispute'];

/** 記事のテキストからキーワードを抽出する */
function extractKeywords(article: NewsArticleWithId): string[] {
  const text = `${article.title} ${article.description}`;
  const found: string[] = [];

  for (const kw of COUNTRY_KEYWORDS) {
    if (text.includes(kw)) {
      found.push(kw);
    }
  }
  for (const kw of TOPIC_KEYWORDS) {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      found.push(kw);
    }
  }

  return found;
}

/** 2つのキーワードセットの共通要素数を返す */
function countCommon(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter(kw => setB.has(kw)).length;
}

/** 関係タイプを判定する */
function detectRelationType(a: NewsArticleWithId, b: NewsArticleWithId, commonKeywords: string[]): NewsRelationType {
  const textA = `${a.title} ${a.description}`;
  const textB = `${b.title} ${b.description}`;
  const combined = `${textA} ${textB}`;

  // 因果関係: 片方に因果キーワードがあり、共通トピックがある
  const hasCausal = CAUSAL_KEYWORDS.some(kw => textB.includes(kw));
  const hasCommonTopic = commonKeywords.some(kw => TOPIC_KEYWORDS.map(t => t.toLowerCase()).includes(kw.toLowerCase()));
  if (hasCausal && hasCommonTopic) {
    return '因果関係';
  }

  // 対立: 対立キーワードがある
  const hasConflict = CONFLICT_KEYWORDS.some(kw => combined.includes(kw));
  if (hasConflict && commonKeywords.length >= 1) {
    return '対立';
  }

  // 連鎖: 時間的に近い同テーマのニュース
  const timeA = new Date(a.publishedAt).getTime();
  const timeB = new Date(b.publishedAt).getTime();
  const timeDiffHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);
  if (timeDiffHours <= 48 && hasCommonTopic && commonKeywords.length >= 3) {
    return '連鎖';
  }

  return '関連';
}

/** confidence（確信度）を計算する */
function calcConfidence(commonCount: number, totalA: number, totalB: number): number {
  if (totalA === 0 || totalB === 0) return 0;
  const jaccard = commonCount / (totalA + totalB - commonCount);
  return Math.min(1, Math.max(0, jaccard * 2));
}

/** ニュース記事間の関係性を検出する */
export function linkNews(articles: readonly NewsArticleWithId[]): NewsRelation[] {
  if (articles.length < 2) return [];

  const keywordsMap = new Map<string, string[]>();
  for (const article of articles) {
    keywordsMap.set(article.id, extractKeywords(article));
  }

  const relations: NewsRelation[] = [];

  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const a = articles[i];
      const b = articles[j];
      const kwA = keywordsMap.get(a.id)!;
      const kwB = keywordsMap.get(b.id)!;
      const commonKws = kwA.filter(kw => kwB.includes(kw));
      const commonCount = commonKws.length;

      // 共通キーワードが2つ以上あるか、国名が共通している場合のみ関連
      if (commonCount < 2) {
        const hasCommonCountry = commonKws.some(kw => COUNTRY_KEYWORDS.includes(kw));
        if (!hasCommonCountry) continue;
      }

      const relationType = detectRelationType(a, b, commonKws);
      const confidence = calcConfidence(commonCount, kwA.length, kwB.length);
      if (confidence < 0.15) continue;

      const commonStr = commonKws.slice(0, 3).join('・');

      relations.push({
        sourceId: a.id,
        targetId: b.id,
        relationType,
        description: `共通キーワード: ${commonStr}`,
        confidence,
      });
    }
  }

  return relations;
}
