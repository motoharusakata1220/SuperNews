// 字幕の蓄積・管理（ファイルI/O）

import fs from "fs";
import path from "path";

export function createStore(baseDir) {
  const transcriptsDir = path.join(baseDir, "transcripts");
  const summariesFile = path.join(baseDir, "summaries.json");
  if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
  }
  return { transcriptsDir, summariesFile };
}

export function saveTranscript(store, video, text) {
  const filePath = path.join(store.transcriptsDir, `${video.videoId}.txt`);
  const header = `タイトル: ${video.title}\nURL: ${video.url}\n公開日: ${video.published}\n\n`;
  fs.writeFileSync(filePath, header + text, "utf-8");

  const summaries = loadSummaries(store);
  summaries.push({
    videoId: video.videoId,
    title: video.title,
    url: video.url,
    published: video.published,
    savedAt: new Date().toISOString(),
  });
  fs.writeFileSync(store.summariesFile, JSON.stringify(summaries, null, 2), "utf-8");
}

function loadSummaries(store) {
  if (!fs.existsSync(store.summariesFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(store.summariesFile, "utf-8"));
  } catch {
    return [];
  }
}

export function getExistingVideoIds(store) {
  const summaries = loadSummaries(store);
  return new Set(summaries.map((s) => s.videoId));
}

export function filterNewVideos(store, videos) {
  const existing = getExistingVideoIds(store);
  return videos.filter((v) => !existing.has(v.videoId));
}
