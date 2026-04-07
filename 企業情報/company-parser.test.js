import { describe, it, expect } from 'vitest';
import { parseDocumentInfo, summarizeCompany, formatCurrency } from './company-parser.js';

describe('parseDocumentInfo', () => {
  it('EDINET書類情報から必要なフィールドを抽出する', () => {
    const rawDoc = {
      docID: 'S100ABC1',
      edinetCode: 'E02144',
      filerName: 'トヨタ自動車株式会社',
      docTypeCode: '120',
      docDescription: '有価証券報告書－第120期(2025/04/01－2026/03/31)',
      periodStart: '2025-04-01',
      periodEnd: '2026-03-31',
      submitDateTime: '2026-06-25 16:00',
      secCode: '72030'
    };

    const result = parseDocumentInfo(rawDoc);

    expect(result).toEqual({
      docId: 'S100ABC1',
      edinetCode: 'E02144',
      companyName: 'トヨタ自動車株式会社',
      docType: '有価証券報告書',
      description: '有価証券報告書－第120期(2025/04/01－2026/03/31)',
      periodStart: '2025-04-01',
      periodEnd: '2026-03-31',
      submitDate: '2026-06-25 16:00',
      securityCode: '7203'
    });
  });

  it('secCode が null のとき securityCode は空文字になる', () => {
    const rawDoc = {
      docID: 'S100ABC1',
      edinetCode: 'E02144',
      filerName: 'テスト企業',
      docTypeCode: '130',
      docDescription: '四半期報告書',
      periodStart: '2025-04-01',
      periodEnd: '2025-06-30',
      submitDateTime: '2025-08-10 16:00',
      secCode: null
    };

    const result = parseDocumentInfo(rawDoc);
    expect(result.securityCode).toBe('');
    expect(result.docType).toBe('四半期報告書');
  });
});

describe('summarizeCompany', () => {
  it('企業の書類リストをサマリーにまとめる', () => {
    const companyConfig = { code: '7203', name: 'トヨタ自動車', edinetCode: 'E02144' };
    const documents = [
      {
        docId: 'S100ABC1',
        edinetCode: 'E02144',
        companyName: 'トヨタ自動車株式会社',
        docType: '有価証券報告書',
        description: '有価証券報告書－第120期',
        periodStart: '2025-04-01',
        periodEnd: '2026-03-31',
        submitDate: '2026-06-25 16:00',
        securityCode: '7203'
      },
      {
        docId: 'S100ABC2',
        edinetCode: 'E02144',
        companyName: 'トヨタ自動車株式会社',
        docType: '四半期報告書',
        description: '四半期報告書－第121期第1四半期',
        periodStart: '2026-04-01',
        periodEnd: '2026-06-30',
        submitDate: '2026-08-10 16:00',
        securityCode: '7203'
      }
    ];

    const summary = summarizeCompany(companyConfig, documents);

    expect(summary.code).toBe('7203');
    expect(summary.name).toBe('トヨタ自動車');
    expect(summary.totalDocuments).toBe(2);
    expect(summary.documents).toHaveLength(2);
    expect(summary.latestSubmitDate).toBe('2026-08-10 16:00');
  });

  it('書類が0件のとき latestSubmitDate は null になる', () => {
    const companyConfig = { code: '7203', name: 'トヨタ自動車', edinetCode: 'E02144' };
    const summary = summarizeCompany(companyConfig, []);

    expect(summary.totalDocuments).toBe(0);
    expect(summary.latestSubmitDate).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('数値を日本円フォーマットに変換する', () => {
    expect(formatCurrency(1000000)).toBe('1,000,000円');
  });

  it('0 のとき 0円 を返す', () => {
    expect(formatCurrency(0)).toBe('0円');
  });
});
