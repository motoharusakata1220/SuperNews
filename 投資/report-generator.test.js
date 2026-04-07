import { describe, it, expect } from "vitest";
import { parseTranscriptFile, buildReportHtml } from "./report-generator.js";

describe("parseTranscriptFile", () => {
  it("ヘッダーと本文を分離して返す", () => {
    const content = `タイトル: テスト動画
URL: https://www.youtube.com/watch?v=abc123
公開日: 2026-04-01T10:00:00+00:00

これは本文です。テストの内容が続きます。`;

    const result = parseTranscriptFile(content);
    expect(result.title).toBe("テスト動画");
    expect(result.url).toBe("https://www.youtube.com/watch?v=abc123");
    expect(result.published).toBe("2026-04-01T10:00:00+00:00");
    expect(result.body).toBe("これは本文です。テストの内容が続きます。");
  });

  it("ヘッダーがないファイルのときtitleをnullで返す", () => {
    const result = parseTranscriptFile("ただのテキスト");
    expect(result.title).toBeNull();
    expect(result.body).toBe("ただのテキスト");
  });
});

describe("buildReportHtml", () => {
  const entries = [
    {
      title: "動画A",
      url: "https://youtube.com/watch?v=aaa",
      published: "2026-04-02T10:00:00+00:00",
      body: "動画Aの内容。重要なポイントが含まれています。",
    },
    {
      title: "動画B",
      url: "https://youtube.com/watch?v=bbb",
      published: "2026-04-01T08:00:00+00:00",
      body: "動画Bの内容。別の視点を提供します。",
    },
  ];

  it("HTML文字列を返す", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("viewport metaタグを含む（モバイル対応）", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain('name="viewport"');
    expect(html).toContain("width=device-width");
  });

  it("全エントリのタイトルを含む", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain("動画A");
    expect(html).toContain("動画B");
  });

  it("公開日を日付のみで表示する", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain("2026-04-02");
  });

  it("YouTubeリンクを含む", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain('href="https://youtube.com/watch?v=aaa"');
  });

  it("本文の先頭200文字を要約として表示する", () => {
    const longBody = "あ".repeat(300);
    const html = buildReportHtml([{
      title: "長い動画",
      url: "https://youtube.com/watch?v=xxx",
      published: "2026-04-01",
      body: longBody,
    }]);
    expect(html).toContain("あ".repeat(200));
    expect(html).toContain("...");
  });

  it("エントリが0件のとき「データなし」メッセージを含む", () => {
    const html = buildReportHtml([]);
    expect(html).toContain("データなし");
  });

  it("生成日時を含む", () => {
    const html = buildReportHtml(entries);
    expect(html).toContain("2026");
  });
});
