import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAnalysisPrompt, parseAnalysisResult, analyzeIndustry } from './industry-analyzer.js';

describe('buildAnalysisPrompt', () => {
  it('業種データからLLM用プロンプトを構築する', () => {
    const industryName = '輸送用機器';
    const documents = [
      { companyName: 'トヨタ', docType: '有価証券報告書', description: 'トヨタ有報 第120期' },
      { companyName: 'ホンダ', docType: '四半期報告書', description: 'ホンダ四半期 第1Q' }
    ];
    const goldenCrossStocks = [
      { name: 'トヨタ', code: '7203' }
    ];

    const prompt = buildAnalysisPrompt(industryName, documents, goldenCrossStocks);

    expect(prompt).toContain('輸送用機器');
    expect(prompt).toContain('トヨタ');
    expect(prompt).toContain('ホンダ');
    expect(prompt).toContain('ゴールデンクロス');
    expect(prompt).toContain('7203');
  });

  it('ゴールデンクロス銘柄がないときも正常にプロンプトを構築する', () => {
    const prompt = buildAnalysisPrompt('電気機器', [{ companyName: 'ソニー', docType: '有報', description: 'test' }], []);
    expect(prompt).toContain('電気機器');
    expect(prompt).toContain('ゴールデンクロス銘柄: なし');
  });
});

describe('parseAnalysisResult', () => {
  it('LLMの応答テキストをそのまま返す', () => {
    const result = parseAnalysisResult('業界は成長傾向にあります。');
    expect(result).toBe('業界は成長傾向にあります。');
  });

  it('空文字のとき デフォルトメッセージを返す', () => {
    const result = parseAnalysisResult('');
    expect(result).toBe('分析結果を取得できませんでした。');
  });
});

describe('analyzeIndustry', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('claude --print を使って分析を実行する（execをモック）', async () => {
    const mockExec = vi.fn().mockResolvedValueOnce({
      stdout: '輸送用機器業界は堅調です。EV化が転換点となっています。',
      stderr: ''
    });

    const result = await analyzeIndustry(
      '輸送用機器',
      [{ companyName: 'トヨタ', docType: '有報', description: 'test' }],
      [],
      mockExec
    );

    expect(result).toContain('堅調');
    expect(mockExec).toHaveBeenCalledTimes(1);
    // 実行コマンドにclaude --printが含まれる
    expect(mockExec.mock.calls[0][0]).toContain('claude');
  });

  it('実行エラーのときフォールバックメッセージを返す', async () => {
    const mockExec = vi.fn().mockRejectedValueOnce(new Error('command not found'));

    const result = await analyzeIndustry('電気機器', [], [], mockExec);

    expect(result).toBe('分析結果を取得できませんでした。');
  });
});
