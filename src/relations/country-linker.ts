import { NewsArticleWithId, CountryRelation, CountryRelationType } from './types';

/** 国名/別名 → alpha-3コードのマッピング */
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'アメリカ': 'USA', '米国': 'USA', '米': 'USA', 'USA': 'USA', 'United States': 'USA',
  '日本': 'JPN', '日': 'JPN', 'Japan': 'JPN',
  'ドイツ': 'DEU', '独': 'DEU', 'Germany': 'DEU',
  'イギリス': 'GBR', '英国': 'GBR', '英': 'GBR', 'UK': 'GBR', 'Britain': 'GBR',
  'フランス': 'FRA', '仏': 'FRA', 'France': 'FRA',
  '中国': 'CHN', '中': 'CHN', 'China': 'CHN',
  'インド': 'IND', 'India': 'IND',
  'ブラジル': 'BRA', 'Brazil': 'BRA',
  '韓国': 'KOR', 'South Korea': 'KOR', 'Korea': 'KOR',
  'オーストラリア': 'AUS', '豪州': 'AUS', 'Australia': 'AUS',
  'カナダ': 'CAN', 'Canada': 'CAN',
  'イタリア': 'ITA', '伊': 'ITA', 'Italy': 'ITA',
  'メキシコ': 'MEX', 'Mexico': 'MEX',
  'インドネシア': 'IDN', 'Indonesia': 'IDN',
  'トルコ': 'TUR', 'Turkey': 'TUR', 'Türkiye': 'TUR',
  'ロシア': 'RUS', 'Russia': 'RUS',
  'ウクライナ': 'UKR', 'Ukraine': 'UKR',
  '台湾': 'TWN', 'Taiwan': 'TWN',
  'イラン': 'IRN', 'Iran': 'IRN',
  'サウジアラビア': 'SAU', 'Saudi Arabia': 'SAU',
  '北朝鮮': 'PRK', 'North Korea': 'PRK',
};

/** 国名は長い順にマッチングする（「北朝鮮」が「朝鮮」より先にマッチ等） */
const SORTED_COUNTRY_NAMES = Object.keys(COUNTRY_NAME_TO_CODE)
  .sort((a, b) => b.length - a.length);

/** 略称ペア（「日米」「米中」など） */
const PAIR_ABBREVIATIONS: Record<string, [string, string]> = {
  '日米': ['JPN', 'USA'], '米日': ['USA', 'JPN'],
  '日中': ['JPN', 'CHN'], '中日': ['CHN', 'JPN'],
  '米中': ['USA', 'CHN'], '中米': ['CHN', 'USA'],
  '日韓': ['JPN', 'KOR'], '韓日': ['KOR', 'JPN'],
  '日英': ['JPN', 'GBR'], '英日': ['GBR', 'JPN'],
  '日仏': ['JPN', 'FRA'], '日独': ['JPN', 'DEU'],
  '日印': ['JPN', 'IND'], '日豪': ['JPN', 'AUS'],
  '米露': ['USA', 'RUS'], '米英': ['USA', 'GBR'],
  '英仏': ['GBR', 'FRA'], '独仏': ['DEU', 'FRA'],
};

const ALLIANCE_KEYWORDS = ['同盟', '連携', '協力', '共同', 'alliance', 'cooperation', 'partnership', 'joint'];
const TRADE_KEYWORDS = ['貿易', '通商', '経済協定', 'FTA', 'EPA', 'trade', 'commerce', '輸出', '輸入'];
const SANCTION_KEYWORDS = ['制裁', 'sanction', '禁輸', 'embargo'];
const CONFLICT_KEYWORDS = ['紛争', '戦争', '侵攻', '攻撃', '軍事衝突', 'war', 'invasion', 'attack', 'conflict', 'strike', 'missile', 'bomb', 'military'];
const DIPLOMACY_KEYWORDS = ['外交', '首脳会談', 'summit', 'diplomacy', '条約', 'treaty', '協議'];

/** 記事テキストから含まれる国コードを抽出する */
function extractCountryCodes(text: string): string[] {
  const codes = new Set<string>();

  // ペア略称を先にチェック
  for (const [abbr, pair] of Object.entries(PAIR_ABBREVIATIONS)) {
    if (text.includes(abbr)) {
      codes.add(pair[0]);
      codes.add(pair[1]);
    }
  }

  for (const name of SORTED_COUNTRY_NAMES) {
    if (text.includes(name)) {
      codes.add(COUNTRY_NAME_TO_CODE[name]);
    }
  }

  return Array.from(codes);
}

/** 関係タイプを判定する */
function detectRelationType(text: string): CountryRelationType {
  if (SANCTION_KEYWORDS.some(kw => text.includes(kw))) return '制裁';
  if (CONFLICT_KEYWORDS.some(kw => text.includes(kw))) return '紛争';
  if (ALLIANCE_KEYWORDS.some(kw => text.includes(kw))) return '同盟';
  if (TRADE_KEYWORDS.some(kw => text.includes(kw))) return '貿易';
  if (DIPLOMACY_KEYWORDS.some(kw => text.includes(kw))) return '外交';
  return '外交';
}

/** 関係タイプに基づくstrengthの基本値 */
function baseStrength(relType: CountryRelationType): number {
  switch (relType) {
    case '同盟': return 0.8;
    case '貿易': return 0.5;
    case '外交': return 0.3;
    case '対立': return -0.5;
    case '制裁': return -0.7;
    case '紛争': return -0.9;
  }
}

/** ペアキーを作成（常にアルファベット順） */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

/** ニュース記事群から国家間の関係性を抽出する */
export function linkCountries(articles: readonly NewsArticleWithId[]): CountryRelation[] {
  if (articles.length === 0) return [];

  // 中間集約用
  const pairMap = new Map<string, {
    countryA: string;
    countryB: string;
    types: CountryRelationType[];
    contexts: string[];
    articleIds: string[];
  }>();

  for (const article of articles) {
    const text = `${article.title} ${article.description}`;
    const codes = extractCountryCodes(text);

    if (codes.length < 2) continue;

    const relType = detectRelationType(text);

    // 全ペアについて関係を記録
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const key = pairKey(codes[i], codes[j]);
        const sorted = [codes[i], codes[j]].sort();

        if (!pairMap.has(key)) {
          pairMap.set(key, {
            countryA: sorted[0],
            countryB: sorted[1],
            types: [],
            contexts: [],
            articleIds: [],
          });
        }

        const entry = pairMap.get(key)!;
        entry.types.push(relType);
        entry.contexts.push(article.title);
        entry.articleIds.push(article.id);
      }
    }
  }

  // 集約して出力
  const now = new Date().toISOString();
  const results: CountryRelation[] = [];

  for (const entry of pairMap.values()) {
    // 最頻の関係タイプを採用
    const typeCount = new Map<CountryRelationType, number>();
    for (const t of entry.types) {
      typeCount.set(t, (typeCount.get(t) || 0) + 1);
    }
    let dominantType: CountryRelationType = entry.types[0];
    let maxCount = 0;
    for (const [t, c] of typeCount) {
      if (c > maxCount) {
        dominantType = t;
        maxCount = c;
      }
    }

    results.push({
      countryA: entry.countryA,
      countryB: entry.countryB,
      relationType: dominantType,
      strength: baseStrength(dominantType),
      context: entry.contexts.join(' / '),
      sourceArticleIds: entry.articleIds,
      updatedAt: now,
    });
  }

  return results;
}
