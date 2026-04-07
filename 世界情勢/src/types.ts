export type NewsCategory = '世界情勢' | '経済ニュース' | 'テクノロジー' | '地域紛争' | 'その他';

export interface NewsArticle {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly publishedAt: string; // ISO 8601
  readonly source: string;
  readonly category: NewsCategory;
}

export interface RawArticle {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly publishedAt: string;
  readonly source: string;
}

export interface Collector {
  readonly name: string;
  collect(): Promise<RawArticle[]>;
}

export interface CategoryGrouped {
  readonly [category: string]: NewsArticle[];
}
