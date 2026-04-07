import { describe, it, expect } from 'vitest';
import { classifyByIndustry, getIndustrySummary } from './industry-classifier.js';

describe('classifyByIndustry', () => {
  const industryMap = new Map([
    ['E00001', { name: 'トヨタ', securityCode: '7203', industry: '輸送用機器' }],
    ['E00002', { name: 'ホンダ', securityCode: '7267', industry: '輸送用機器' }],
    ['E00003', { name: 'ソニー', securityCode: '6758', industry: '電気機器' }],
    ['E00004', { name: 'NTT', securityCode: '9432', industry: '情報・通信業' }]
  ]);

  const documents = [
    { edinetCode: 'E00001', docType: '有価証券報告書', description: 'トヨタ有報' },
    { edinetCode: 'E00002', docType: '四半期報告書', description: 'ホンダ四半期' },
    { edinetCode: 'E00003', docType: '有価証券報告書', description: 'ソニー有報' },
    { edinetCode: 'E00004', docType: '有価証券報告書', description: 'NTT有報' },
    { edinetCode: 'E99999', docType: '有価証券報告書', description: '不明企業' }
  ];

  it('業種別に書類をグルーピングする', () => {
    const result = classifyByIndustry(documents, industryMap);

    expect(result.has('輸送用機器')).toBe(true);
    expect(result.has('電気機器')).toBe(true);
    expect(result.has('情報・通信業')).toBe(true);
    expect(result.get('輸送用機器')).toHaveLength(2);
    expect(result.get('電気機器')).toHaveLength(1);
  });

  it('industryMapにない企業は「その他・不明」に分類する', () => {
    const result = classifyByIndustry(documents, industryMap);

    expect(result.has('その他・不明')).toBe(true);
    expect(result.get('その他・不明')).toHaveLength(1);
  });

  it('空の書類リストのとき空のMapを返す', () => {
    const result = classifyByIndustry([], industryMap);
    expect(result.size).toBe(0);
  });
});

describe('getIndustrySummary', () => {
  it('業種別の件数サマリーを降順で返す', () => {
    const classified = new Map([
      ['輸送用機器', [{ edinetCode: 'E1' }, { edinetCode: 'E2' }, { edinetCode: 'E3' }]],
      ['電気機器', [{ edinetCode: 'E4' }]],
      ['情報・通信業', [{ edinetCode: 'E5' }, { edinetCode: 'E6' }]]
    ]);

    const summary = getIndustrySummary(classified);

    expect(summary[0]).toEqual({ industry: '輸送用機器', count: 3 });
    expect(summary[1]).toEqual({ industry: '情報・通信業', count: 2 });
    expect(summary[2]).toEqual({ industry: '電気機器', count: 1 });
  });
});
