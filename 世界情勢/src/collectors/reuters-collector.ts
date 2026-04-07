import { Collector, RawArticle } from '../types';
import { fetchRss } from './rss-fetcher';
import { RSS_SOURCES } from '../config/sources';

const REUTERS_SOURCE = RSS_SOURCES.find((s) => s.name === 'Reuters')!;

export class ReutersCollector implements Collector {
  readonly name = 'Reuters';

  async collect(): Promise<RawArticle[]> {
    return fetchRss(REUTERS_SOURCE.url, this.name);
  }
}
