/** ニュース間の関係タイプ */
export type NewsRelationType = '因果関係' | '関連' | '対立' | '連鎖' | '背景';

/** ニュース間の関係性 */
export interface NewsRelation {
  readonly sourceId: string;
  readonly targetId: string;
  readonly relationType: NewsRelationType;
  readonly description: string;
  readonly confidence: number; // 0〜1
}

/** 国家間の関係タイプ */
export type CountryRelationType = '同盟' | '対立' | '貿易' | '制裁' | '外交' | '紛争';

/** 国家間の関係性 */
export interface CountryRelation {
  readonly countryA: string; // alpha-3コード
  readonly countryB: string;
  readonly relationType: CountryRelationType;
  readonly strength: number; // -1(敵対) 〜 +1(友好)
  readonly context: string;
  readonly sourceArticleIds: readonly string[];
  readonly updatedAt: string;
}

/** 関係性分析に渡すニュース記事（IDを持つ） */
export interface NewsArticleWithId {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly publishedAt: string;
  readonly source: string;
  readonly category: string;
}

/** 関係性グラフ全体 */
export interface RelationGraph {
  readonly newsRelations: readonly NewsRelation[];
  readonly countryRelations: readonly CountryRelation[];
  readonly generatedAt: string;
}
