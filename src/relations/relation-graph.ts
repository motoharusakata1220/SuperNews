import { NewsArticleWithId, RelationGraph } from './types';
import { linkNews } from './news-linker';
import { linkCountries } from './country-linker';

/** ニュース記事群から関係性グラフを構築する */
export function buildRelationGraph(articles: readonly NewsArticleWithId[]): RelationGraph {
  return {
    newsRelations: linkNews(articles),
    countryRelations: linkCountries(articles),
    generatedAt: new Date().toISOString(),
  };
}
