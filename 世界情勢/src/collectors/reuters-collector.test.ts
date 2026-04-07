import { ReutersCollector } from './reuters-collector';

const SAMPLE_REUTERS_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Reuters</title>
    <item>
      <title>Oil prices surge amid tensions</title>
      <description>Crude oil prices rose sharply.</description>
      <link>https://www.reuters.com/1</link>
      <pubDate>Fri, 04 Apr 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe('ReutersCollector', () => {
  const collector = new ReutersCollector();

  test('名前がReutersである', () => {
    expect(collector.name).toBe('Reuters');
  });

  test('RSSを取得してRawArticle配列を返す', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_REUTERS_RSS,
    } as Response);

    const result = await collector.collect();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Oil prices surge amid tensions');
    expect(result[0].source).toBe('Reuters');
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
