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
import type { PipelineInput, SourceArticle } from './types';

const mockArticles: readonly SourceArticle[] = [
  { title: '円安が進行', summary: 'ドル円が150円台に', category: '投資' },
  { title: 'AI半導体需要', summary: 'NVIDIA株が急騰', category: '企業情報' },
  { title: '米中関係緊張', summary: '関税引き上げ', category: '世界情勢' },
];

const baseInput: PipelineInput = {
  age: 30,
  interests: ['投資', '経済', 'テクノロジー'],
  niche: '投資・経済',
  topic: '円安の影響',
  targetAudience: '20-40代の投資初心者',
  subscribers: 1000,
  monthlyViews: 10000,
  budget: 0,
  weeklyHours: 10,
};

describe('formatSourceContext', () => {
  test('記事をカテゴリ別にフォーマットする', () => {
    const result = formatSourceContext(mockArticles);

    expect(result).toContain('【投資】');
    expect(result).toContain('【企業情報】');
    expect(result).toContain('円安が進行');
  });

  test('記事がない場合はデフォルトメッセージを返す', () => {
    const result = formatSourceContext([]);
    expect(result).toBe('（収集データなし）');
  });
});

describe('buildNicheAnalysisPrompt', () => {
  test('年齢と興味がプロンプトに含まれる', () => {
    const result = buildNicheAnalysisPrompt(baseInput, '背景情報');

    expect(result).toContain('30歳');
    expect(result).toContain('投資・経済・テクノロジー');
    expect(result).toContain('CPM率');
    expect(result).toContain('JSON');
  });
});

describe('buildFacelessVideoPrompt', () => {
  test('ニッチとターゲットがプロンプトに含まれる', () => {
    const result = buildFacelessVideoPrompt(baseInput, '背景情報');

    expect(result).toContain('投資・経済');
    expect(result).toContain('20-40代の投資初心者');
    expect(result).toContain('顔なし');
    expect(result).toContain('SEO');
  });
});

describe('buildViralTitlePrompt', () => {
  test('トピックとカテゴリ分類が含まれる', () => {
    const result = buildViralTitlePrompt(baseInput, '背景情報');

    expect(result).toContain('円安の影響');
    expect(result).toContain('好奇心');
    expect(result).toContain('数字');
    expect(result).toContain('恐怖');
    expect(result).toContain('変革');
    expect(result).toContain('20個');
  });
});

describe('buildAutomationPrompt', () => {
  test('$0予算と無料ツールが含まれる', () => {
    const result = buildAutomationPrompt(baseInput, '背景情報');

    expect(result).toContain('$0予算');
    expect(result).toContain('無料');
    expect(result).toContain('バッチ');
    expect(result).toContain('3チャンネル');
  });
});

describe('buildRevenuePrompt', () => {
  test('登録者数と視聴回数が含まれる', () => {
    const result = buildRevenuePrompt(baseInput, '背景情報');

    expect(result).toContain('1000人');
    expect(result).toContain('10000');
    expect(result).toContain('adSenseEstimate');
    expect(result).toContain('topAffiliates');
  });
});

describe('buildAlgorithmPrompt', () => {
  test('アルゴリズム最適化の要素が含まれる', () => {
    const result = buildAlgorithmPrompt(baseInput, '背景情報');

    expect(result).toContain('アルゴリズム');
    expect(result).toContain('thumbnailABTest');
    expect(result).toContain('shortsStrategy');
    expect(result).toContain('weeklyChecklist');
  });
});

describe('buildNinetyDayPlanPrompt', () => {
  test('90日計画のパラメータが含まれる', () => {
    const result = buildNinetyDayPlanPrompt(baseInput, '背景情報');

    expect(result).toContain('30歳');
    expect(result).toContain('$0');
    expect(result).toContain('週10時間');
    expect(result).toContain('90日');
  });
});

describe('buildRetentionScriptPrompt', () => {
  test('視聴維持の要素が含まれる', () => {
    const result = buildRetentionScriptPrompt(baseInput, '背景情報');

    expect(result).toContain('円安の影響');
    expect(result).toContain('3秒');
    expect(result).toContain('オープンループ');
    expect(result).toContain('パターン中断');
    expect(result).toContain('CTA');
  });
});

describe('buildThumbnailPsychologyPrompt', () => {
  test('サムネイル心理学の要素が含まれる', () => {
    const result = buildThumbnailPsychologyPrompt('テストタイトル', '背景情報');

    expect(result).toContain('テストタイトル');
    expect(result).toContain('CTR');
    expect(result).toContain('3〜5語');
    expect(result).toContain('colorScheme');
  });
});

describe('buildShortsGrowthPrompt', () => {
  test('Shorts戦略の要素が含まれる', () => {
    const result = buildShortsGrowthPrompt(baseInput, '背景情報');

    expect(result).toContain('Shorts');
    expect(result).toContain('30個');
    expect(result).toContain('ループ');
    expect(result).toContain('投稿頻度');
  });
});

describe('buildCompetitorAnalysisPrompt', () => {
  test('競合分析の要素が含まれる', () => {
    const result = buildCompetitorAnalysisPrompt(baseInput, '背景情報');

    expect(result).toContain('トップ5');
    expect(result).toContain('弱点');
    expect(result).toContain('10個の動画アイデア');
  });
});

describe('buildFirst10VideosPrompt', () => {
  test('最初の10本動画の要素が含まれる', () => {
    const result = buildFirst10VideosPrompt(baseInput, '背景情報');

    expect(result).toContain('10本');
    expect(result).toContain('サムネイル');
    expect(result).toContain('急速成長');
  });
});
