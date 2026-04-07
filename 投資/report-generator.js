// transcript ファイルを読み取り、iPhone対応HTMLレポートを生成する

import fs from "fs";
import path from "path";

export function parseTranscriptFile(content) {
  const titleMatch = content.match(/^タイトル: (.+)$/m);
  const urlMatch = content.match(/^URL: (.+)$/m);
  const publishedMatch = content.match(/^公開日: (.+)$/m);

  if (!titleMatch) {
    return { title: null, url: null, published: null, body: content.trim() };
  }

  const headerEnd = content.indexOf("\n\n");
  const body = headerEnd !== -1 ? content.slice(headerEnd + 2).trim() : "";

  return {
    title: titleMatch[1],
    url: urlMatch?.[1] ?? null,
    published: publishedMatch?.[1] ?? null,
    body,
  };
}

export function buildReportHtml(entries) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const entryCards = entries.length === 0
    ? `<div class="card"><p>データなし</p></div>`
    : entries.map((e) => {
        const date = e.published ? e.published.slice(0, 10) : "不明";
        const summary = e.body.length > 200 ? e.body.slice(0, 200) + "..." : e.body;
        return `
    <div class="card">
      <div class="date">${date}</div>
      <h2>${escapeHtml(e.title ?? "タイトルなし")}</h2>
      ${e.url ? `<a href="${escapeHtml(e.url)}" target="_blank">YouTube で見る</a>` : ""}
      <p class="summary">${escapeHtml(summary)}</p>
    </div>`;
      }).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>投資ニュースまとめ</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.7;
      padding: 16px;
      max-width: 720px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #2563eb;
      margin-bottom: 20px;
    }
    header h1 { font-size: 1.4em; color: #1e40af; }
    .meta { font-size: 0.85em; color: #666; margin-top: 4px; }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card h2 { font-size: 1.1em; margin-bottom: 8px; color: #1e3a5f; }
    .card .date { font-size: 0.8em; color: #888; margin-bottom: 4px; }
    .card a {
      display: inline-block;
      color: #2563eb;
      text-decoration: none;
      font-size: 0.9em;
      margin-bottom: 8px;
    }
    .card .summary {
      font-size: 0.9em;
      color: #555;
      line-height: 1.8;
    }
    .count { text-align: center; color: #888; font-size: 0.85em; margin-bottom: 16px; }
  </style>
</head>
<body>
  <header>
    <h1>投資ニュースまとめ</h1>
    <div class="meta">最終更新: ${now}</div>
  </header>
  <div class="count">${entries.length} 件の記事</div>
${entryCards}
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateReport(transcriptsDir, outputPath) {
  if (!fs.existsSync(transcriptsDir)) return;

  const files = fs.readdirSync(transcriptsDir).filter((f) => f.endsWith(".txt"));
  const entries = files.map((f) => {
    const content = fs.readFileSync(path.join(transcriptsDir, f), "utf-8");
    return parseTranscriptFile(content);
  });

  entries.sort((a, b) => {
    if (!a.published) return 1;
    if (!b.published) return -1;
    return b.published.localeCompare(a.published);
  });

  const html = buildReportHtml(entries);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, html, "utf-8");
  return outputPath;
}
