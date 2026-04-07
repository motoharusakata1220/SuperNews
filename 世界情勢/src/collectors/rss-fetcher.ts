import { XMLParser } from 'fast-xml-parser';
import { RawArticle } from '../types';

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

const parser = new XMLParser({ ignoreAttributes: false });

export function parseRssXml(xml: string, source: string): RawArticle[] {
  try {
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel?.item) return [];

    const items: RssItem[] = Array.isArray(channel.item)
      ? channel.item
      : [channel.item];

    return items.map((item) => ({
      title: String(item.title ?? ''),
      description: String(item.description ?? ''),
      url: String(item.link ?? ''),
      publishedAt: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      source,
    }));
  } catch {
    return [];
  }
}

export async function fetchRss(url: string, source: string): Promise<RawArticle[]> {
  const response = await fetch(url);
  if (!response.ok) return [];
  const xml = await response.text();
  return parseRssXml(xml, source);
}
