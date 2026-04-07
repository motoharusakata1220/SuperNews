import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { PipelineInput, PipelineOutput } from './types';
import { aggregateAllContent } from './content-aggregator';
import {
  formatSourceContext,
  buildNicheAnalysisPrompt,
  buildFacelessVideoPrompt,
  buildViralTitlePrompt,
  buildAutomationPrompt,
  buildRevenuePrompt,
  buildAlgorithmPrompt,
  buildNinetyDayPlanPrompt,
  buildRetentionScriptPrompt,
  buildThumbnailPsychologyPrompt,
  buildShortsGrowthPrompt,
  buildCompetitorAnalysisPrompt,
  buildFirst10VideosPrompt,
} from './prompt-templates';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/** Claude Code --print でAI生成を実行（無料） */
export function callClaude(prompt: string): string {
  const escapedPrompt = prompt.replace(/'/g, "'\\''");
  try {
    const result = execSync(
      `claude --print '${escapedPrompt}'`,
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10, timeout: 120000 },
    );
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Claude呼び出しに失敗: ${msg}`);
  }
}

/** AI出力からJSONを抽出 */
export function extractJson<T>(rawOutput: string): T {
  // ```json ... ``` ブロックを探す
  const jsonBlockMatch = rawOutput.match(/```json\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return JSON.parse(jsonBlockMatch[1].trim());
  }
  // { ... } を直接探す
  const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('JSON出力の抽出に失敗しました');
}

/** 結果をファイルに保存 */
function saveOutput(filename: string, data: unknown, dir: string): string {
  const outputPath = path.join(dir, filename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  return outputPath;
}

/** Markdownレポートを生成 */
function generateMarkdownReport(output: PipelineOutput): string {
  const lines: string[] = [
    `# YouTube動画生成レポート`,
    `生成日時: ${output.generatedAt}`,
    '',
    `## 1. 市場ニッチ分析`,
    `推奨ニッチ: **${output.nicheAnalysis.recommendedNiche}**`,
    '',
    ...output.nicheAnalysis.niches.map(
      (n) =>
        `### ${n.nicheName}\n- CPM: ${n.estimatedCPM}\n- 適合度: ${n.fitScore}/10\n- 難易度: ${n.competition.difficultyLevel}\n- 無料スタート: ${n.canStartFree ? '可能' : '不可'}\n- ヒント: ${n.quickStartTip}`,
    ),
    '',
    `## 2. 顔なしビデオコンセプト`,
    `タイトル: **${output.facelessVideo.title}**`,
    `長さ: ${output.facelessVideo.totalDuration}`,
    '',
    ...output.facelessVideo.sections.map(
      (s) => `### ${s.sectionName} (${s.duration})\n${s.narration}\n\n映像: ${s.visualDirection}`,
    ),
    '',
    `## 3. バイラルタイトル候補`,
    '',
    ...output.viralTitles.titles.map(
      (t, i) =>
        `${i + 1}. **${t.title}** (CTR: ${t.predictedCTR}/10, ${t.category}, SEO: ${t.seoStrength})`,
    ),
    '',
    `## 4. AI自動化ワークフロー`,
    `1本あたりの制作時間: ${output.automationWorkflow.totalTimePerVideo}`,
    '',
    ...output.automationWorkflow.productionSteps.map(
      (s) => `### ${s.stepName}\n- ツール: ${s.freeTools.join(', ')}\n- 時間: ${s.estimatedTime}\n- コツ: ${s.tips}`,
    ),
    '',
    `## 5. 収益計画`,
    `AdSense見積: ${output.revenue.adSenseEstimate}`,
    '',
    `### マイルストーン別収入`,
    ...Object.entries(output.revenue.incomeByMilestone).map(
      ([k, v]) => `- ${k}: ${v}`,
    ),
    '',
    `## 6. アルゴリズム最適化`,
    `理想的な動画長さ: ${output.algorithmOptimization.idealVideoLength}`,
    `アップロード頻度: ${output.algorithmOptimization.optimalUploadFrequency}`,
    '',
    `## 7. 90日間収益計画`,
    `初回収益化: ${output.ninetyDayPlan.firstMonetizationDate}`,
    '',
    ...output.ninetyDayPlan.weeks.map(
      (w) => `### ${w.week} — ${w.phase}\n- 登録者目標: ${w.subscriberGoal}人\n- ${w.dailyActions.join('\n- ')}`,
    ),
    '',
    `## 8. 視聴維持脚本`,
    `推定維持率: ${output.retentionScript.estimatedRetentionRate}`,
    '',
    ...output.retentionScript.segments.map(
      (s) => `### [${s.timestamp}] ${s.type}\n${s.narration}\n\n映像: ${s.visualDirection}`,
    ),
    '',
    `## 9. サムネイル心理学`,
    '',
    ...output.thumbnailPsychology.concepts.map(
      (c, i) =>
        `${i + 1}. **「${c.exactText}」** — CTR: ${c.estimatedCTR}/10\n   配色: ${c.colorScheme.join(', ')}\n   クリック理由: ${c.clickReason}`,
    ),
    '',
    `## 10. Shorts成長戦略`,
    `最適長さ: ${output.shortsGrowth.optimalLength}`,
    `投稿頻度: ${output.shortsGrowth.postingFrequency}`,
    '',
    `## 11. 競合分析`,
    '',
    ...output.competitorAnalysis.topChannels.map(
      (c) => `### ${c.channelName}\n- 成長率: ${c.growthRate}\n- 弱点: ${c.weaknesses.join(', ')}`,
    ),
    '',
    `### 彼らを上回る動画アイデア`,
    ...output.competitorAnalysis.videoIdeasToBeatThem.map(
      (v, i) => `${i + 1}. ${v}`,
    ),
    '',
    `## 12. 最初の10本動画ガイド`,
    '',
    ...output.first10Videos.videos.map(
      (v) =>
        `### ${v.order}. ${v.title}\n- 成功理由: ${v.whyItWorks}\n- サムネイル: ${v.thumbnailAngle}\n- 予想視聴: ${v.expectedViewRange}`,
    ),
    '',
    '---',
    `使用ソース: ${output.sourceArticles.length}件の記事`,
  ];
  return lines.join('\n');
}

/** フレームワーク単体を実行 */
export function runFramework<T>(
  name: string,
  buildPrompt: () => string,
): T {
  console.log(`  [${name}] プロンプト生成中...`);
  const prompt = buildPrompt();
  console.log(`  [${name}] AI生成中...`);
  const raw = callClaude(prompt);
  console.log(`  [${name}] JSON抽出中...`);
  return extractJson<T>(raw);
}

/** メインパイプライン */
export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  console.log('=== YouTube動画生成パイプライン開始 ===');
  console.log(`年齢: ${input.age}, 興味: ${input.interests.join('・')}`);

  // Step 1: 全カテゴリから情報収集
  console.log('\n[1/5] 全カテゴリから情報を収集中...');
  const articles = aggregateAllContent();
  console.log(`  → ${articles.length}件の記事を収集`);

  const context = formatSourceContext(articles);
  const niche = input.niche ?? input.interests[0] ?? '投資';

  // Step 2: フレームワーク1-4 (コアシステム)
  console.log('\n[2/5] コアフレームワーク(1-4)を実行中...');

  const nicheAnalysis = runFramework('ニッチ分析', () =>
    buildNicheAnalysisPrompt(input, context),
  );
  const inputWithNiche = { ...input, niche };

  const facelessVideo = runFramework('顔なしビデオ', () =>
    buildFacelessVideoPrompt(inputWithNiche, context),
  );
  const viralTitles = runFramework('バイラルタイトル', () =>
    buildViralTitlePrompt(inputWithNiche, context),
  );
  const automationWorkflow = runFramework('自動化ワークフロー', () =>
    buildAutomationPrompt(inputWithNiche, context),
  );

  // Step 3: フレームワーク5-8 (成長・収益)
  console.log('\n[3/5] 成長・収益フレームワーク(5-8)を実行中...');

  const revenue = runFramework('収益計画', () =>
    buildRevenuePrompt(inputWithNiche, context),
  );
  const algorithmOptimization = runFramework('アルゴリズム最適化', () =>
    buildAlgorithmPrompt(inputWithNiche, context),
  );
  const ninetyDayPlan = runFramework('90日計画', () =>
    buildNinetyDayPlanPrompt(inputWithNiche, context),
  );
  const retentionScript = runFramework('視聴維持脚本', () =>
    buildRetentionScriptPrompt(inputWithNiche, context),
  );

  // Step 4: フレームワーク9-12 (最適化・戦略)
  console.log('\n[4/5] 最適化・戦略フレームワーク(9-12)を実行中...');

  const videoTitle = (facelessVideo as { title?: string }).title ?? `${niche}の真実`;
  const thumbnailPsychology = runFramework('サムネイル心理学', () =>
    buildThumbnailPsychologyPrompt(videoTitle, context),
  );
  const shortsGrowth = runFramework('Shorts成長', () =>
    buildShortsGrowthPrompt(inputWithNiche, context),
  );
  const competitorAnalysis = runFramework('競合分析', () =>
    buildCompetitorAnalysisPrompt(inputWithNiche, context),
  );
  const first10Videos = runFramework('10本動画ガイド', () =>
    buildFirst10VideosPrompt(inputWithNiche, context),
  );

  // Step 5: 結果をまとめて保存
  console.log('\n[5/5] 結果を保存中...');
  const output: PipelineOutput = {
    nicheAnalysis: nicheAnalysis as PipelineOutput['nicheAnalysis'],
    facelessVideo: facelessVideo as PipelineOutput['facelessVideo'],
    viralTitles: viralTitles as PipelineOutput['viralTitles'],
    automationWorkflow: automationWorkflow as PipelineOutput['automationWorkflow'],
    revenue: revenue as PipelineOutput['revenue'],
    algorithmOptimization: algorithmOptimization as PipelineOutput['algorithmOptimization'],
    ninetyDayPlan: ninetyDayPlan as PipelineOutput['ninetyDayPlan'],
    retentionScript: retentionScript as PipelineOutput['retentionScript'],
    thumbnailPsychology: thumbnailPsychology as PipelineOutput['thumbnailPsychology'],
    shortsGrowth: shortsGrowth as PipelineOutput['shortsGrowth'],
    competitorAnalysis: competitorAnalysis as PipelineOutput['competitorAnalysis'],
    first10Videos: first10Videos as PipelineOutput['first10Videos'],
    sourceArticles: articles,
    generatedAt: new Date().toISOString(),
  };

  // JSON保存
  const analysisDir = path.join(PROJECT_ROOT, '動画生成', '分析結果');
  const outputDir = path.join(PROJECT_ROOT, 'output', '動画');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  saveOutput(`pipeline-${timestamp}.json`, output, analysisDir);
  console.log(`  → 分析結果JSON保存完了`);

  // Markdownレポート保存
  const report = generateMarkdownReport(output);
  const reportPath = path.join(outputDir, `レポート-${timestamp}.md`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`  → レポート保存完了: ${reportPath}`);

  // 台本を個別保存
  const scriptDir = path.join(PROJECT_ROOT, '動画生成', '台本');
  fs.mkdirSync(scriptDir, { recursive: true });
  const scriptContent = output.retentionScript.segments
    ?.map((s) => `[${s.timestamp}] ${s.type}\n${s.narration}\n\n映像指示: ${s.visualDirection}\n`)
    .join('\n---\n\n') ?? '';
  fs.writeFileSync(
    path.join(scriptDir, `台本-${timestamp}.md`),
    `# ${output.retentionScript.topic}\n\n${scriptContent}`,
    'utf-8',
  );
  console.log(`  → 台本保存完了`);

  console.log('\n=== パイプライン完了 ===');
  return output;
}

// CLI実行
if (require.main === module) {
  const input: PipelineInput = {
    age: 30,
    interests: ['投資', '経済', 'テクノロジー'],
    niche: '投資・経済ニュース',
    topic: '知られざる経済指標が示す未来',
    targetAudience: '20-40代の資産形成に興味がある層',
    subscribers: 0,
    monthlyViews: 0,
    budget: 0,
    weeklyHours: 10,
  };

  runPipeline(input)
    .then(() => console.log('完了！'))
    .catch((e) => {
      console.error('エラー:', e);
      process.exit(1);
    });
}
