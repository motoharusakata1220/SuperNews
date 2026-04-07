import { NewsArticle } from '../types';

export function deduplicate(articles: NewsArticle[]): NewsArticle[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: NewsArticle[] = [];

  for (const article of articles) {
    if (seenUrls.has(article.url)) continue;
    if (seenTitles.has(article.title)) continue;

    seenUrls.add(article.url);
    seenTitles.add(article.title);
    result.push(article);
  }

  return result;
}
