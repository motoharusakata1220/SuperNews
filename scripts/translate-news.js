#!/usr/bin/env node
/**
 * translate-news.js
 * world-news.json の英語記事を日本語に翻訳する。
 * claude --print を使用（無料）。
 *
 * 使い方: node scripts/translate-news.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_PATH = path.join(__dirname, '..', 'output', '動画', 'data', 'world-news.json');

function isJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

function translateBatch(articles) {
  const toTranslate = articles.filter(a => !isJapanese(a.title));
  if (toTranslate.length === 0) {
    console.log('  翻訳不要（全て日本語）');
    return articles;
  }

  console.log(`  ${toTranslate.length}件の英語記事を翻訳中...`);

  // バッチで翻訳（20件ずつ）
  const batchSize = 20;
  const translated = new Map();

  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const batch = toTranslate.slice(i, i + batchSize);
    const prompt = `以下のニュース記事のtitleとdescriptionを日本語に翻訳してください。
JSONの配列で返してください。各オブジェクトは {"index": 元のインデックス, "title_ja": "日本語タイトル", "desc_ja": "日本語説明"} の形式。
翻訳は自然な日本語で、ニュース記事として違和感のないようにしてください。

${batch.map((a, idx) => `[${i + idx}] title: ${a.title}\ndesc: ${a.description || ''}`).join('\n\n')}`;

    try {
      const escapedPrompt = prompt.replace(/'/g, "'\\''");
      const result = execSync(`claude --print '${escapedPrompt}'`, {
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 5,
        timeout: 120000,
      });

      // JSONを抽出
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.forEach(item => {
          translated.set(item.index, item);
        });
        console.log(`  バッチ ${Math.floor(i / batchSize) + 1}: ${parsed.length}件翻訳完了`);
      }
    } catch (err) {
      console.log(`  バッチ ${Math.floor(i / batchSize) + 1}: 翻訳失敗（スキップ）`);
    }
  }

  // 翻訳結果をマージ
  return articles.map((a, idx) => {
    if (isJapanese(a.title)) return a;
    const globalIdx = toTranslate.indexOf(a);
    const tr = translated.get(globalIdx);
    if (tr) {
      return {
        ...a,
        title: tr.title_ja || a.title,
        description: tr.desc_ja || a.description,
        originalTitle: a.title,
        originalDescription: a.description,
      };
    }
    return a;
  });
}

// メイン処理
if (!fs.existsSync(DATA_PATH)) {
  console.log('world-news.json が見つかりません。先に collect-all.sh を実行してください。');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
console.log(`翻訳開始: ${data.articles.length}件`);

data.articles = translateBatch(data.articles);
data.translatedAt = new Date().toISOString();

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('翻訳完了。world-news.json を更新しました。');
