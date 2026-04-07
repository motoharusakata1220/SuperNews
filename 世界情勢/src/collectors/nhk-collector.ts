import { Collector, RawArticle } from '../types';
import { fetchRss } from './rss-fetcher';
import { RSS_SOURCES } from '../config/sources';

const NHK_SOURCE = RSS_SOURCES.find((s) => s.name === 'NHK World')!;

export class NhkCollector implements Collector {
  readonly name = 'NHK World';

  async collect(): Promise<RawArticle[]> {
    return fetchRss(NHK_SOURCE.url, this.name);
  }
}
