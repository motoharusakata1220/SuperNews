export interface RssSource {
  readonly name: string;
  readonly url: string;
  readonly language: 'ja' | 'en' | 'multi';
  readonly region: 'global' | 'americas' | 'europe' | 'asia' | 'middle-east' | 'africa';
}

export const RSS_SOURCES: readonly RssSource[] = [
  // --- 日本 ---
  {
    name: 'NHK World',
    url: 'https://www3.nhk.or.jp/rss/news/cat0.xml',
    language: 'ja',
    region: 'asia',
  },
  // --- グローバル��信社 ---
  {
    name: 'Reuters',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best',
    language: 'en',
    region: 'global',
  },
  {
    name: 'AP News',
    url: 'https://rsshub.app/apnews/topics/apf-topnews',
    language: 'en',
    region: 'global',
  },
  // --- 欧州 ---
  {
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    language: 'en',
    region: 'europe',
  },
  {
    name: 'The Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    language: 'en',
    region: 'europe',
  },
  {
    name: 'DW News',
    url: 'https://rss.dw.com/rdf/rss-en-all',
    language: 'en',
    region: 'europe',
  },
  {
    name: 'France 24',
    url: 'https://www.france24.com/en/rss',
    language: 'en',
    region: 'europe',
  },
  // --- 米州 ---
  {
    name: 'NPR World',
    url: 'https://feeds.npr.org/1004/rss.xml',
    language: 'en',
    region: 'americas',
  },
  {
    name: 'CNBC Economy',
    url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
    language: 'en',
    region: 'americas',
  },
  // --- アジア ---
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    language: 'en',
    region: 'middle-east',
  },
  {
    name: 'SCMP',
    url: 'https://www.scmp.com/rss/91/feed',
    language: 'en',
    region: 'asia',
  },
  {
    name: 'Nikkei Asia',
    url: 'https://asia.nikkei.com/rss',
    language: 'en',
    region: 'asia',
  },
] as const;
