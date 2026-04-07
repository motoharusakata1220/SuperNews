import { parseRssXml } from './rss-fetcher';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>テスト記事1</title>
      <description>記事1の説明</description>
      <link>https://example.com/1</link>
      <pubDate>Mon, 01 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>テスト記事2</title>
      <description>記事2の説明</description>
      <link>https://example.com/2</link>
      <pubDate>Tue, 02 Apr 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const EMPTY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Empty Feed</title>
  </channel>
</rss>`;

const SINGLE_ITEM_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Single Feed</title>
    <item>
      <title>単一記事</title>
      <description>説明</description>
      <link>https://example.com/single</link>
      <pubDate>Wed, 03 Apr 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe('parseRssXml', () => {
  test('複数アイテムのRSSをパースできる', () => {
    const result = parseRssXml(SAMPLE_RSS, 'TestSource');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: 'テスト記事1',
      description: '記事1の説明',
      url: 'https://example.com/1',
      publishedAt: '2026-04-01T10:00:00.000Z',
      source: 'TestSource',
    });
    expect(result[1]).toEqual({
      title: 'テスト記事2',
      description: '記事2の説明',
      url: 'https://example.com/2',
      publishedAt: '2026-04-02T12:00:00.000Z',
      source: 'TestSource',
    });
  });

  test('アイテムがないRSSのとき空配列を返す', () => {
    const result = parseRssXml(EMPTY_RSS, 'TestSource');
    expect(result).toEqual([]);
  });

  test('アイテムが1つのとき配列として返す', () => {
    const result = parseRssXml(SINGLE_ITEM_RSS, 'TestSource');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('単一記事');
  });

  test('不正なXMLのとき空配列を返す', () => {
    const result = parseRssXml('not xml at all', 'TestSource');
    expect(result).toEqual([]);
  });
});
