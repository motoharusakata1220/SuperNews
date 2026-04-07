import type { PipelineInput, SourceArticle, FacelessVideoOutput } from './types';

/** ソース記事を要約テキストに変換 */
export function formatSourceContext(articles: readonly SourceArticle[]): string {
  if (articles.length === 0) return '（収集データなし）';
  const grouped = new Map<string, SourceArticle[]>();
  for (const a of articles) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }
  const sections: string[] = [];
  for (const [cat, items] of grouped) {
    const lines = items.map((a) => `- ${a.title}: ${a.summary}`).join('\n');
    sections.push(`【${cat}】\n${lines}`);
  }
  return sections.join('\n\n');
}

/** フレームワーク1: 市場ニッチ分析プロンプト */
export function buildNicheAnalysisPrompt(
  input: PipelineInput,
  context: string,
): string {
  return `あなたはYouTube市場分析の専門家です。以下の背景情報を活用して分析してください。

## 背景情報（SuperNewsが収集したニッチ情報）
${context}

## 分析依頼
私は${input.age}歳で、${input.interests.join('・')}に興味があります。
YouTubeでAIを使ってお金を稼ぎたいです。分析して、以下をJSON形式で教えてください：

1. CPM率が最も高い5つのニッチ
2. 私の年齢と興味に合ったニッチ
3. 各ニッチの競争分析（totalChannels, averageViews, difficultyLevel, entryBarrier）
4. 1K/10K/100K人のサブスクライバーでの現実的な収入の可能性
5. 予算なしで今日から始められるニッチ

並び順：収益化が最も簡単で最も速いもの順。

## 出力形式（厳密にこのJSON構造で）
{
  "niches": [
    {
      "nicheName": "ニッチ名",
      "estimatedCPM": "$X-$Y",
      "fitScore": 8,
      "competition": { "totalChannels": "約X万", "averageViews": "約X万", "difficultyLevel": "低|中|高", "entryBarrier": "説明" },
      "incomeProjection": { "subscribers1K": "$X/月", "subscribers10K": "$X/月", "subscribers100K": "$X/月" },
      "canStartFree": true,
      "quickStartTip": "今日から始めるヒント"
    }
  ],
  "recommendedNiche": "最もおすすめのニッチ名"
}`;
}

/** フレームワーク2: 顔なしビデオシステムプロンプト */
export function buildFacelessVideoPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  const audience = input.targetAudience ?? '20-40代の知識欲がある視聴者';
  return `あなたはYouTube動画制作の専門家です。顔出し不要の動画コンセプトを作成します。

## 背景情報
${context}

## 依頼
${niche}チャンネル向けに${audience}を対象とした、YouTube用の完全な顔なしビデオコンセプトを作成してください。

以下を含むJSON形式で出力：
{
  "title": "SEO最適化されたタイトル",
  "seoKeywords": ["キーワード1", "キーワード2"],
  "targetAudience": "${audience}",
  "niche": "${niche}",
  "thumbnail": {
    "text": "サムネイルのテキスト",
    "colors": ["#色1", "#色2"],
    "style": "スタイル説明",
    "emotionalTrigger": "感情トリガー"
  },
  "musicMood": "BGMの雰囲気",
  "sections": [
    {
      "sectionName": "セクション名",
      "narration": "ナレーション全文",
      "visualDirection": "映像指示（アーカイブ映像・図解等）",
      "archiveKeywords": ["検索キーワード1"],
      "duration": "X分Y秒"
    }
  ],
  "totalDuration": "X分",
  "estimatedCPM": "$X"
}

台本は10分以上の動画を想定し、フック→本題→CTA の構成で。ナレーションは自然で聞きやすい日本語で書いてください。`;
}

/** フレームワーク3: バイラルタイトルジェネレータープロンプト */
export function buildViralTitlePrompt(
  input: PipelineInput,
  context: string,
): string {
  const topic = input.topic ?? input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTube SEOとバイラルコンテンツの専門家です。

## 背景情報
${context}

## 依頼
「${topic}」についてのYouTube動画を作成します。バイラルになる20個のタイトルを生成してください：

- 好奇心を刺激する5つのタイトル
- 数字を使った5つのタイトル
- 恐怖/緊急性を生む5つのタイトル
- 変革を表す5つのタイトル

JSON形式で出力：
{
  "topic": "${topic}",
  "titles": [
    {
      "title": "タイトル文",
      "category": "好奇心|数字|恐怖・緊急性|変革",
      "predictedCTR": 8,
      "targetEmotion": "対象感情",
      "thumbnailStyle": "最適なサムネイルスタイル",
      "seoStrength": "低|中|高|最高"
    }
  ]
}

バイラル性が高い順にソートしてください。`;
}

/** フレームワーク4: AI自動化ワークフロープロンプト */
export function buildAutomationPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTube自動化の専門家です。$0予算で最大効率のシステムを設計します。

## 背景情報
${context}

## 依頼
${niche}チャンネル向けYouTube自動化の完全システムを、$0予算で設計してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "productionSteps": [
    { "stepName": "ステップ名", "freeTools": ["ツール名"], "estimatedTime": "X分", "tips": "コツ" }
  ],
  "totalTimePerVideo": "X時間Y分（目標: 2時間未満）",
  "batchSystem": "1ヶ月分のバッチ生産方法の説明",
  "uploadCalendar": [
    { "dayOfWeek": "月曜", "time": "18:00", "reason": "理由" }
  ],
  "multiChannelStrategy": "3チャンネル同時管理の方法",
  "reinvestmentPlan": [
    { "milestone": "収益$X到達時", "action": "投資先", "expectedROI": "期待リターン" }
  ],
  "monetizationStrategies": ["AdSense以外の戦略1", "戦略2"]
}

全てのツールは無料のものだけを使用してください。Claude Code --print、Canva無料版、CapCut等。`;
}

/** フレームワーク5: 複数収入源プロンプト */
export function buildRevenuePrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  const subs = input.subscribers ?? 1000;
  const views = input.monthlyViews ?? 10000;
  return `あなたはYouTube収益化の専門家です。

## 背景情報
${context}

## 依頼
${niche}に関するYouTubeチャンネル（登録者${subs}人、月間視聴回数${views}）の包括的な収益計画を作成してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "subscribers": ${subs},
  "monthlyViews": ${views},
  "adSenseEstimate": "月額$X",
  "topAffiliates": [
    { "name": "プログラム名", "commission": "X%", "fitReason": "適合理由" }
  ],
  "digitalProductIdeas": ["アイデア1"],
  "sponsorshipRates": "1動画あたり$X",
  "merchandisingPotential": "説明",
  "paidCommunityModel": "有料コミュニティの設計",
  "courseOpportunities": "コース・コーチングの機会",
  "incomeByMilestone": {
    "1000人": "$X/月",
    "5000人": "$X/月",
    "10000人": "$X/月",
    "50000人": "$X/月"
  }
}`;
}

/** フレームワーク6: アルゴリズム最適化プロンプト */
export function buildAlgorithmPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTubeアルゴリズムの専門家です。

## 背景情報
${context}

## 依頼
YouTubeの現在の${niche}アルゴリズムを分析してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "idealVideoLength": "X分〜Y分（理由付き）",
  "optimalUploadFrequency": "週X本（理由付き）",
  "tagStrategy": "2025-2026年で機能するタグ戦略",
  "thumbnailABTest": "A/Bテストのアプローチ",
  "suggestedVideoAlgorithm": "提案動画アルゴリズムを活性化する方法",
  "communityPostStrategy": "コミュニティ投稿戦略",
  "shortsStrategy": "ショート動画戦略",
  "first24HourStrategy": "最初の24時間での投稿戦略",
  "weeklyChecklist": [
    { "day": "月曜", "tasks": ["タスク1", "タスク2"] }
  ]
}`;
}

/** フレームワーク7: 90日間収益計画プロンプト */
export function buildNinetyDayPlanPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  const budget = input.budget ?? 0;
  const hours = input.weeklyHours ?? 10;
  return `あなたはYouTubeチャンネル成長戦略の専門家です。

## 背景情報
${context}

## 依頼
${input.age}歳、${niche}のYouTubeチャンネルを始める。予算$${budget}、週${hours}時間。
90日間の完全な収益計画を作成してください。

JSON形式で出力：
{
  "age": ${input.age},
  "niche": "${niche}",
  "budget": ${budget},
  "weeklyHours": ${hours},
  "weeks": [
    {
      "week": "1-2週目",
      "phase": "設定と最初の動画",
      "dailyActions": ["アクション1"],
      "subscriberGoal": 50,
      "milestone": "マイルストーン"
    }
  ],
  "firstMonetizationDate": "X日目頃",
  "incomeMilestones": {
    "$100": "約X日後",
    "$500": "約X日後",
    "$1000": "約X日後"
  },
  "growthStallStrategy": "成長が停滞したときの対処法",
  "commonMistakes": ["ミス1", "ミス2"]
}`;
}

/** フレームワーク8: 視聴維持脚本プロンプト */
export function buildRetentionScriptPrompt(
  input: PipelineInput,
  context: string,
): string {
  const topic = input.topic ?? input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTube脚本ライティングの専門家です。視聴維持率を最大化する脚本を書きます。

## 背景情報
${context}

## 依頼
「${topic}」についてのYouTube動画の脚本を書いてください。視聴維持率が高いものにします。

要件：
- 最初の3秒で視聴者を引きつけるフック
- 好奇心を維持するオープンループ
- 10〜15秒ごとにパターン中断
- ナレーションとサスペンス
- 離脱しそうなタイミングで注意を再活性化するフレーズ
- 力強い行動喚起（CTA）で終わる

JSON形式で出力：
{
  "topic": "${topic}",
  "totalDuration": "X分Y秒",
  "segments": [
    {
      "timestamp": "0:00-0:15",
      "type": "フック|オープンループ|パターン中断|本題|CTA",
      "narration": "ナレーション全文",
      "visualDirection": "映像指示",
      "retentionTip": "このセグメントの維持テクニック"
    }
  ],
  "dropOffPoints": [
    { "timestamp": "X:XX", "reason": "離脱理由", "solution": "対策" }
  ],
  "estimatedRetentionRate": "X%"
}`;
}

/** フレームワーク9: サムネイル心理学プロンプト */
export function buildThumbnailPsychologyPrompt(
  videoTitle: string,
  context: string,
): string {
  return `あなたはYouTubeサムネイルデザインと視聴者心理の専門家です。

## 背景情報
${context}

## 依頼
YouTube動画のタイトル：「${videoTitle}」
CTRを最大化する5つのサムネイルコンセプトをデザインしてください。

JSON形式で出力：
{
  "videoTitle": "${videoTitle}",
  "concepts": [
    {
      "exactText": "3〜5語のサムネイルテキスト",
      "expression": "使用する表情または感情",
      "colorScheme": ["#色1", "#色2", "#色3"],
      "contrastStrategy": "視覚的コントラスト戦略",
      "conversionPoint": "転換点の説明",
      "clickReason": "人がクリックする心理的理由",
      "estimatedCTR": 8
    }
  ]
}

CTRの可能性が高い順に並べてください。`;
}

/** フレームワーク10: YouTube Shorts成長エンジンプロンプト */
export function buildShortsGrowthPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTube Shorts戦略の専門家です。

## 背景情報
${context}

## 依頼
${niche}チャンネルをShortsで成長させる戦略を作成してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "ideas": [
    {
      "title": "ショートタイトル",
      "hook": "最初の1秒のフック",
      "format": "使用フォーマット",
      "loopStrategy": "ループ戦略",
      "cta": "プロフィールクリックを生むCTA"
    }
  ],
  "optimalLength": "最適な長さ",
  "postingFrequency": "投稿頻度",
  "conversionStrategy": "ショート視聴者を長編購読者に変換する方法",
  "effectiveFormats": ["フォーマット1", "フォーマット2"]
}

30個のバイラルアイデアを生成してください。`;
}

/** フレームワーク11: 競合分析プロンプト */
export function buildCompetitorAnalysisPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTube競合分析の専門家です。

## 背景情報
${context}

## 依頼
${niche}の主要なYouTubeチャンネルを分析してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "topChannels": [
    {
      "channelName": "チャンネル名",
      "growthRate": "成長率",
      "topVideoTypes": ["動画タイプ1"],
      "viewToSubRatio": "視聴者/購読者比率",
      "weaknesses": ["弱点1"]
    }
  ],
  "uncoveredContentAreas": ["未カバー領域1"],
  "thumbnailWeaknesses": ["サムネイル弱点1"],
  "immediateImprovements": ["すぐに改善できる点1"],
  "videoIdeasToBeatThem": ["彼らを上回る動画アイデア1"]
}

成長率の高いトップ5チャンネルと、彼らを上回るための10個の動画アイデアを含めてください。`;
}

/** フレームワーク12: 最初の10本動画ガイドプロンプト */
export function buildFirst10VideosPrompt(
  input: PipelineInput,
  context: string,
): string {
  const niche = input.niche ?? input.interests[0] ?? '投資';
  return `あなたはYouTubeチャンネル立ち上げの専門家です。

## 背景情報
${context}

## 依頼
${niche}で新しいYouTubeチャンネルを作成しています。最初の10本の動画を計画してください。

JSON形式で出力：
{
  "niche": "${niche}",
  "videos": [
    {
      "order": 1,
      "title": "クリック最適化されたタイトル",
      "whyItWorks": "この動画が成功する理由",
      "thumbnailAngle": "サムネイルの提案アングル",
      "targetInterest": "ターゲットオーディエンスの興味",
      "expectedViewRange": "予想視聴回数範囲"
    }
  ],
  "growthStrategy": "急速成長のための並べ替え戦略の説明"
}

急速成長するように最適な順番で並べてください。`;
}
