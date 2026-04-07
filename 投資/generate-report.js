#!/usr/bin/env node

// transcriptsフォルダの全字幕からモバイル対応HTMLレポートを生成
// 使い方: node generate-report.js

import path from "path";
import { fileURLToPath } from "url";
import { generateReport } from "./report-generator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const transcriptsDir = path.join(__dirname, "transcripts");
const outputPath = path.join(__dirname, "..", "output", "投資レポート.html");

const result = generateReport(transcriptsDir, outputPath);
if (result) {
  console.log(`✅ レポート生成完了: ${result}`);
} else {
  console.log("❌ transcripts/ フォルダが見つかりません");
}
