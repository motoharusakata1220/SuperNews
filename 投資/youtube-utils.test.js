import { describe, it, expect } from "vitest";
import { parseRssFeed, extractVideoId } from "./youtube-utils.js";

describe("extractVideoId", () => {
  it("通常のwatch URLのときvideoIdを返す", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
      .toBe("dQw4w9WgXcQ");
  });

  it("短縮URLのときvideoIdを返す", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ"))
      .toBe("dQw4w9WgXcQ");
  });

  it("embed URLのときvideoIdを返す", () => {
    expect(extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"))
      .toBe("dQw4w9WgXcQ");
  });

  it("shorts URLのときvideoIdを返す", () => {
    expect(extractVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"))
      .toBe("dQw4w9WgXcQ");
  });

  it("無効なURLのときnullを返す", () => {
    expect(extractVideoId("https://example.com")).toBeNull();
  });
});

describe("parseRssFeed", () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <entry>
    <yt:videoId>abc123def45</yt:videoId>
    <title>テスト動画1</title>
    <published>2026-04-01T10:00:00+00:00</published>
  </entry>
  <entry>
    <yt:videoId>xyz789ghi01</yt:videoId>
    <title>テスト動画2</title>
    <published>2026-03-30T08:00:00+00:00</published>
  </entry>
</feed>`;

  it("RSSフィードから動画情報を抽出する", () => {
    const videos = parseRssFeed(sampleXml);
    expect(videos).toHaveLength(2);
  });

  it("各動画にvideoId, title, published, urlが含まれる", () => {
    const videos = parseRssFeed(sampleXml);
    expect(videos[0]).toEqual({
      videoId: "abc123def45",
      title: "テスト動画1",
      published: "2026-04-01T10:00:00+00:00",
      url: "https://www.youtube.com/watch?v=abc123def45",
    });
  });

  it("空のフィードのとき空配列を返す", () => {
    expect(parseRssFeed("<feed></feed>")).toEqual([]);
  });
});
