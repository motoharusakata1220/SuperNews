#!/usr/bin/env node

// YouTube動画の字幕テキストを取得するスクリプト（要約はClaude Codeが会話内で行う）
// 使い方:
//   node get-transcript.js --channel                → テンバガー研究家の最新動画一覧
//   node get-transcript.js --channel --fetch N      → 最新N本の字幕を一括取得
//   node get-transcript.js <YouTube URL>            → 1本の字幕取得

import fs from "node:fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";
import { parseRssFeed, extractVideoId } from "./youtube-utils.js";
import { createStore, saveTranscript, getExistingVideoIds, filterNewVideos } from "./transcript-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadChannels() {
  const configPath = path.join(__dirname, "channels.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  return config.channels;
}

const store = createStore(__dirname);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function getTranscript(videoId) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  if (!transcript || transcript.length === 0) return null;
  return transcript.map((entry) => entry.text).join(" ");
}

const args = process.argv.slice(2);

if (args.includes("--channel")) {
  const channels = loadChannels();
  const channelArg = args[args.indexOf("--channel") + 1];
  const targetChannels = channelArg && !channelArg.startsWith("--")
    ? channels.filter((c) => c.name.includes(channelArg))
    : channels;

  if (targetChannels.length === 0) {
    console.error(`❌ チャンネルが見つかりません: ${channelArg}`);
    console.error(`登録チャンネル: ${channels.map((c) => c.name).join(", ")}`);
    process.exit(1);
  }

  const fetchIndex = args.indexOf("--fetch");
  const existing = getExistingVideoIds(store);

  for (const channel of targetChannels) {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;

    if (fetchIndex !== -1) {
      const n = parseInt(args[fetchIndex + 1], 10) || 3;
      let xml;
      try {
        xml = await fetchUrl(rssUrl);
      } catch (e) {
        console.log(`\n⚠️ ${channel.name} - RSS取得失敗: ${e.message}`);
        continue;
      }
      const videos = parseRssFeed(xml);
      const newVideos = filterNewVideos(store, videos).slice(0, n);

      console.log(`\n📺 ${channel.name}（${channel.genre}）- 未処理${newVideos.length}件の字幕を取得\n`);

      for (const video of newVideos) {
        process.stdout.write(`  ${video.title} ... `);
        try {
          const text = await getTranscript(video.videoId);
          if (text) {
            saveTranscript(store, video, text);
            console.log(`✅ (${text.length}文字)`);
          } else {
            console.log("⚠️ 字幕なし");
          }
        } catch (e) {
          console.log(`❌ ${e.message}`);
        }
      }
    } else {
      let xml;
      try {
        xml = await fetchUrl(rssUrl);
      } catch (e) {
        console.log(`\n⚠️ ${channel.name} - RSS取得失敗: ${e.message}`);
        continue;
      }
      const videos = parseRssFeed(xml);

      console.log(`\n📺 ${channel.name}（${channel.genre}）- 最新動画一覧\n`);
      videos.forEach((v, i) => {
        const done = existing.has(v.videoId) ? " ✅済" : " 🆕新規";
        console.log(`  ${i + 1}. [${v.published?.substring(0, 10)}]${done} ${v.title}`);
        console.log(`     ${v.url}`);
      });
      console.log(`\n合計: ${videos.length}件（処理済: ${existing.size}件）\n`);
    }
  }

  if (fetchIndex !== -1) {
    console.log("\n💡 transcripts/ フォルダに保存しました\n");
  }
} else if (args.length > 0) {
  const videoId = extractVideoId(args[0]);
  if (!videoId) {
    console.error("❌ 有効なYouTube URLを指定してください");
    process.exit(1);
  }
  console.log(`\n📝 字幕を取得中: ${args[0]}`);
  try {
    const text = await getTranscript(videoId);
    if (!text) {
      console.error("❌ 字幕が取得できませんでした");
      process.exit(1);
    }
    saveTranscript(store, {
      videoId,
      title: videoId,
      url: args[0],
      published: new Date().toISOString(),
    }, text);
    console.log(`✅ 保存完了 (${text.length}文字)\n`);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
} else {
  console.error("使い方:");
  console.error("  node get-transcript.js <YouTube URL>       1本の字幕取得");
  console.error("  node get-transcript.js --channel            動画一覧表示");
  console.error("  node get-transcript.js --channel --fetch 3  最新3本の字幕取得");
  process.exit(1);
}
