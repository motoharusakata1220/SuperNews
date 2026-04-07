import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadEnv, getRequiredEnv } from './env-loader.js';

describe('getRequiredEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('環境変数が設定されているとき 値を返す', () => {
    process.env.EDINET_API_KEY = 'test-key-123';
    expect(getRequiredEnv('EDINET_API_KEY')).toBe('test-key-123');
  });

  it('環境変数が未設定のとき エラーを投げる', () => {
    delete process.env.EDINET_API_KEY;
    expect(() => getRequiredEnv('EDINET_API_KEY')).toThrow(
      '環境変数 EDINET_API_KEY が設定されていません'
    );
  });

  it('環境変数が空文字のとき エラーを投げる', () => {
    process.env.EDINET_API_KEY = '';
    expect(() => getRequiredEnv('EDINET_API_KEY')).toThrow(
      '環境変数 EDINET_API_KEY が設定されていません'
    );
  });
});

describe('loadEnv', () => {
  it('.envファイルが存在しなくてもエラーにならない', () => {
    expect(() => loadEnv('/nonexistent/path/.env')).not.toThrow();
  });
});
