import { Collector, RawArticle } from '../types';
import { fetchRss } from './rss-fetcher';
import { RSS_SOURCES } from '../config/sources';

const BBC_SOURCE = RSS_SOURCES.find((s) => s.name === 'BBC World')!;

export class BbcCollector implements Collector {
  readonly name = 'BBC World';

  async collect(): Promise<RawArticle[]> {
    return fetchRss(BBC_SOURCE.url, this.name);
  }
}
