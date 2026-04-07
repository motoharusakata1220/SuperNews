import { describe, it, expect } from 'vitest';
import { validateConfig, loadConfig } from './config-validator.js';

describe('validateConfig', () => {
  it('正しい設定のとき true を返す', () => {
    const config = {
      edinet: {
        baseUrl: 'https://api.edinet-fsa.go.jp/api/v2',
        docTypes: ['120']
      }
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('edinet 設定がないとき エラーを投げる', () => {
    expect(() => validateConfig({})).toThrow('EDINET設定は必須です');
  });

  it('baseUrl がないとき エラーを投げる', () => {
    const config = { edinet: { docTypes: ['120'] } };
    expect(() => validateConfig(config)).toThrow('EDINET baseUrlは必須です');
  });

  it('docTypes が空のとき エラーを投げる', () => {
    const config = { edinet: { baseUrl: 'https://example.com', docTypes: [] } };
    expect(() => validateConfig(config)).toThrow('対象書類種別(docTypes)が1つ以上必要です');
  });
});

describe('loadConfig', () => {
  it('config.json を正常に読み込める', () => {
    const config = loadConfig();
    expect(config.edinet).toBeDefined();
    expect(config.edinet.docTypes.length).toBeGreaterThan(0);
  });
});
