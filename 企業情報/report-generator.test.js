import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateReport, generateMarkdown } from './report-generator.js';
import { existsSync, readFileSync, rmSync } from 'node:fs';

const TEST_OUTPUT_DIR = '/tmp/test-report-output';

describe('generateMarkdown', () => {
  it('業種別分類からMarkdownレポートを生成する', () => {
    const classifiedData = new Map([
      ['輸送用機器', [
        {
          companyName: 'トヨタ自動車',
          securityCode: '7203',
          docType: '有価証券報告書',
          description: '有価証券報告書－第120期',
          submitDate: '2026-06-25 16:00',
        },
        {
          companyName: 'トヨタ自動車',
          securityCode: '7203',
          docType: '四半期報告書',
          description: '四半期報告書－第121期第1四半期',
          submitDate: '2026-08-10 16:00',
        },
      ]],
    ]);
    const analysisResults = new Map();
    const goldenCrossResults = [];

    const markdown = generateMarkdown(classifiedData, analysisResults, goldenCrossResults, '2026-04-01', '2026-04-04');

    expect(markdown).toContain('# 企業情報レポート');
    expect(markdown).toContain('トヨタ自動車');
    expect(markdown).toContain('7203');
    expect(markdown).toContain('有価証券報告書');
    expect(markdown).toContain('2026-04-01');
  });

  it('ゴールデンクロス銘柄が無いとき「該当銘柄なし」を表示する', () => {
    const classifiedData = new Map([
      ['その他・不明', [
        {
          companyName: 'テスト企業',
          securityCode: '9999',
          docType: '有価証券報告書',
          description: 'テスト',
          submitDate: null,
        },
      ]],
    ]);

    const markdown = generateMarkdown(classifiedData, new Map(), [], '2026-04-01', '2026-04-04');

    expect(markdown).toContain('テスト企業');
    expect(markdown).toContain('該当銘柄なし');
  });
});

describe('generateReport', () => {
  beforeEach(() => {
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  it('ファイルに書き出す', () => {
    const classifiedData = new Map([
      ['輸送用機器', [
        {
          companyName: 'トヨタ自動車',
          securityCode: '7203',
          docType: '有価証券報告書',
          description: '有価証券報告書',
          submitDate: '2026-06-25 16:00',
        },
      ]],
    ]);

    const filePath = generateReport(classifiedData, new Map(), [], '2026-04-01', '2026-04-04', TEST_OUTPUT_DIR);

    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('トヨタ自動車');
  });
});
