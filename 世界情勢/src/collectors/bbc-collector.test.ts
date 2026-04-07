import { BbcCollector } from './bbc-collector';

const SAMPLE_BBC_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BBC World</title>
    <item>
      <title>Climate summit reaches deal</title>
      <description>World leaders agree on emissions targets.</description>
      <link>https://www.bbc.com/news/1</link>
      <pubDate>Fri, 04 Apr 2026 07:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe('BbcCollector', () => {
  const collector = new BbcCollector();

  test('名前がBBC Worldである', () => {
    expect(collector.name).toBe('BBC World');
  });

  test('RSSを取得してRawArticle配列を返す', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_BBC_RSS,
    } as Response);

    const result = await collector.collect();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Climate summit reaches deal');
    expect(result[0].source).toBe('BBC World');
  });

  test('HTTP エラーのとき空配列を返す', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await collector.collect();
    expect(result).toEqual([]);
  });
});
