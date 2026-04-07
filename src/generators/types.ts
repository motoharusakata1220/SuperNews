/** カテゴリ名 */
export type CategoryName = '投資' | '世界情勢' | '企業情報' | '経済指標' | '背景知識';

/** 収集された情報ソース */
export interface SourceArticle {
  readonly title: string;
  readonly summary: string;
  readonly category: CategoryName;
  readonly url?: string;
  readonly publishedAt?: string;
}

// ===== フレームワーク1: 市場ニッチ分析 =====

/** ニッチ分析の入力パラメータ */
export interface NicheAnalysisInput {
  readonly age: number;
  readonly interests: readonly string[];
}

/** ニッチの競争分析 */
export interface CompetitionAnalysis {
  readonly totalChannels: string;
  readonly averageViews: string;
  readonly difficultyLevel: '低' | '中' | '高';
  readonly entryBarrier: string;
}

/** サブスクライバー数ごとの収入予測 */
export interface IncomeProjection {
  readonly subscribers1K: string;
  readonly subscribers10K: string;
  readonly subscribers100K: string;
}

/** ニッチ分析結果 */
export interface NicheResult {
  readonly nicheName: string;
  readonly estimatedCPM: string;
  readonly fitScore: number; // 1-10
  readonly competition: CompetitionAnalysis;
  readonly incomeProjection: IncomeProjection;
  readonly canStartFree: boolean;
  readonly quickStartTip: string;
}

/** フレームワーク1の出力 */
export interface NicheAnalysisOutput {
  readonly input: NicheAnalysisInput;
  readonly niches: readonly NicheResult[];
  readonly recommendedNiche: string;
  readonly analysisDate: string;
}

// ===== フレームワーク2: 顔なしビデオシステム =====

/** サムネイルコンセプト */
export interface ThumbnailConcept {
  readonly text: string;
  readonly colors: readonly string[];
  readonly style: string;
  readonly emotionalTrigger: string;
}

/** 台本セクション */
export interface ScriptSection {
  readonly sectionName: string;
  readonly narration: string;
  readonly visualDirection: string;
  readonly archiveKeywords: readonly string[];
  readonly duration: string;
}

/** 顔なしビデオコンセプト */
export interface FacelessVideoOutput {
  readonly title: string;
  readonly seoKeywords: readonly string[];
  readonly targetAudience: string;
  readonly niche: string;
  readonly thumbnail: ThumbnailConcept;
  readonly musicMood: string;
  readonly sections: readonly ScriptSection[];
  readonly totalDuration: string;
  readonly estimatedCPM: string;
}

// ===== フレームワーク3: バイラルタイトルジェネレーター =====

/** タイトルカテゴリ */
export type TitleCategory = '好奇心' | '数字' | '恐怖・緊急性' | '変革';

/** 生成されたタイトル */
export interface ViralTitle {
  readonly title: string;
  readonly category: TitleCategory;
  readonly predictedCTR: number; // 1-10
  readonly targetEmotion: string;
  readonly thumbnailStyle: string;
  readonly seoStrength: '低' | '中' | '高' | '最高';
}

/** フレームワーク3の出力 */
export interface ViralTitleOutput {
  readonly topic: string;
  readonly titles: readonly ViralTitle[];
  readonly generatedAt: string;
}

// ===== フレームワーク4: AI自動化ワークフロー =====

/** 制作ステップ */
export interface ProductionStep {
  readonly stepName: string;
  readonly freeTools: readonly string[];
  readonly estimatedTime: string;
  readonly tips: string;
}

/** アップロードスケジュール */
export interface UploadSchedule {
  readonly dayOfWeek: string;
  readonly time: string;
  readonly reason: string;
}

/** 再投資タイミング */
export interface ReinvestmentMilestone {
  readonly milestone: string;
  readonly action: string;
  readonly expectedROI: string;
}

/** フレームワーク4の出力 */
export interface AutomationWorkflowOutput {
  readonly niche: string;
  readonly productionSteps: readonly ProductionStep[];
  readonly totalTimePerVideo: string;
  readonly batchSystem: string;
  readonly uploadCalendar: readonly UploadSchedule[];
  readonly multiChannelStrategy: string;
  readonly reinvestmentPlan: readonly ReinvestmentMilestone[];
  readonly monetizationStrategies: readonly string[];
}

// ===== フレームワーク5: 複数収入源 =====

/** アフィリエイトプログラム */
export interface AffiliateProgram {
  readonly name: string;
  readonly commission: string;
  readonly fitReason: string;
}

/** 収益計画 */
export interface RevenueOutput {
  readonly niche: string;
  readonly subscribers: number;
  readonly monthlyViews: number;
  readonly adSenseEstimate: string;
  readonly topAffiliates: readonly AffiliateProgram[];
  readonly digitalProductIdeas: readonly string[];
  readonly sponsorshipRates: string;
  readonly merchandisingPotential: string;
  readonly paidCommunityModel: string;
  readonly courseOpportunities: string;
  readonly incomeByMilestone: Record<string, string>;
}

// ===== フレームワーク6: アルゴリズム最適化 =====

/** 週次チェックリスト項目 */
export interface WeeklyCheckItem {
  readonly day: string;
  readonly tasks: readonly string[];
}

/** アルゴリズム最適化出力 */
export interface AlgorithmOptimizationOutput {
  readonly niche: string;
  readonly idealVideoLength: string;
  readonly optimalUploadFrequency: string;
  readonly tagStrategy: string;
  readonly thumbnailABTest: string;
  readonly suggestedVideoAlgorithm: string;
  readonly communityPostStrategy: string;
  readonly shortsStrategy: string;
  readonly first24HourStrategy: string;
  readonly weeklyChecklist: readonly WeeklyCheckItem[];
}

// ===== フレームワーク7: 90日間収益計画 =====

/** 週次計画 */
export interface WeeklyPlan {
  readonly week: string;
  readonly phase: string;
  readonly dailyActions: readonly string[];
  readonly subscriberGoal: number;
  readonly milestone: string;
}

/** 90日間収益計画出力 */
export interface NinetyDayPlanOutput {
  readonly age: number;
  readonly niche: string;
  readonly budget: number;
  readonly weeklyHours: number;
  readonly weeks: readonly WeeklyPlan[];
  readonly firstMonetizationDate: string;
  readonly incomeMilestones: Record<string, string>;
  readonly growthStallStrategy: string;
  readonly commonMistakes: readonly string[];
}

// ===== フレームワーク8: 視聴維持脚本 =====

/** 脚本セグメント */
export interface RetentionScriptSegment {
  readonly timestamp: string;
  readonly type: 'フック' | 'オープンループ' | 'パターン中断' | '本題' | 'CTA';
  readonly narration: string;
  readonly visualDirection: string;
  readonly retentionTip: string;
}

/** 離脱ポイント分析 */
export interface DropOffPoint {
  readonly timestamp: string;
  readonly reason: string;
  readonly solution: string;
}

/** 視聴維持脚本出力 */
export interface RetentionScriptOutput {
  readonly topic: string;
  readonly totalDuration: string;
  readonly segments: readonly RetentionScriptSegment[];
  readonly dropOffPoints: readonly DropOffPoint[];
  readonly estimatedRetentionRate: string;
}

// ===== フレームワーク9: サムネイル心理学 =====

/** サムネイルコンセプト詳細 */
export interface ThumbnailPsychologyConcept {
  readonly exactText: string;
  readonly expression: string;
  readonly colorScheme: readonly string[];
  readonly contrastStrategy: string;
  readonly conversionPoint: string;
  readonly clickReason: string;
  readonly estimatedCTR: number;
}

/** サムネイル心理学出力 */
export interface ThumbnailPsychologyOutput {
  readonly videoTitle: string;
  readonly concepts: readonly ThumbnailPsychologyConcept[];
}

// ===== フレームワーク10: YouTube Shorts成長エンジン =====

/** ショートアイデア */
export interface ShortIdea {
  readonly title: string;
  readonly hook: string;
  readonly format: string;
  readonly loopStrategy: string;
  readonly cta: string;
}

/** Shorts戦略出力 */
export interface ShortsGrowthOutput {
  readonly niche: string;
  readonly ideas: readonly ShortIdea[];
  readonly optimalLength: string;
  readonly postingFrequency: string;
  readonly conversionStrategy: string;
  readonly effectiveFormats: readonly string[];
}

// ===== フレームワーク11: 競合分析 =====

/** 競合チャンネル分析 */
export interface CompetitorChannel {
  readonly channelName: string;
  readonly growthRate: string;
  readonly topVideoTypes: readonly string[];
  readonly viewToSubRatio: string;
  readonly weaknesses: readonly string[];
}

/** 競合分析出力 */
export interface CompetitorAnalysisOutput {
  readonly niche: string;
  readonly topChannels: readonly CompetitorChannel[];
  readonly uncoveredContentAreas: readonly string[];
  readonly thumbnailWeaknesses: readonly string[];
  readonly immediateImprovements: readonly string[];
  readonly videoIdeasToBeatThem: readonly string[];
}

// ===== フレームワーク12: 最初の10本動画ガイド =====

/** 動画プラン */
export interface VideoPlan {
  readonly order: number;
  readonly title: string;
  readonly whyItWorks: string;
  readonly thumbnailAngle: string;
  readonly targetInterest: string;
  readonly expectedViewRange: string;
}

/** 最初の10本動画ガイド出力 */
export interface First10VideosOutput {
  readonly niche: string;
  readonly videos: readonly VideoPlan[];
  readonly growthStrategy: string;
}

// ===== 統合パイプライン =====

/** パイプライン全体の入力 */
export interface PipelineInput {
  readonly age: number;
  readonly interests: readonly string[];
  readonly niche?: string;
  readonly topic?: string;
  readonly targetAudience?: string;
  readonly subscribers?: number;
  readonly monthlyViews?: number;
  readonly budget?: number;
  readonly weeklyHours?: number;
}

/** パイプライン全体の出力 */
export interface PipelineOutput {
  readonly nicheAnalysis: NicheAnalysisOutput;
  readonly facelessVideo: FacelessVideoOutput;
  readonly viralTitles: ViralTitleOutput;
  readonly automationWorkflow: AutomationWorkflowOutput;
  readonly revenue: RevenueOutput;
  readonly algorithmOptimization: AlgorithmOptimizationOutput;
  readonly ninetyDayPlan: NinetyDayPlanOutput;
  readonly retentionScript: RetentionScriptOutput;
  readonly thumbnailPsychology: ThumbnailPsychologyOutput;
  readonly shortsGrowth: ShortsGrowthOutput;
  readonly competitorAnalysis: CompetitorAnalysisOutput;
  readonly first10Videos: First10VideosOutput;
  readonly sourceArticles: readonly SourceArticle[];
  readonly generatedAt: string;
}
