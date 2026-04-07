import { NhkCollector } from './nhk-collector';

const SAMPLE_NHK_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NHKニュース</title>
    <item>
      <title>国際会議で合意成立</title>
      <description>各国首脳が新たな枠組みに合意した。</description>
      <link>https://www3.nhk.or.jp/news/1</link>
      <pubDate>Fri, 04 Apr 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe('NhkCollector', () => {
  const collector = new NhkCollector();

  test('名前がNHK Worldである', () => {
    expect(collector.name).toBe('NHK World');
  });

  test('RSSを取得してRawArticle配列を返す', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_NHK_RSS,
    } as Response);

    const result = await collector.collect();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('国際会議で合意成立');
    expect(result[0].source).toBe('NHK World');
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
