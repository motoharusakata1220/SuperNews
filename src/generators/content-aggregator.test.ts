import {
  extractFromMarkdown,
  extractFromJson,
  collectFilesFromDir,
} from './content-aggregator';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('extractFromMarkdown', () => {
  test('Markdownからタイトルと概要を抽出できる', () => {
    const content = `# テスト記事タイトル

これは概要の1行目です。
これは概要の2行目です。
`;
    const result = extractFromMarkdown(content, '投資', 'test.md');

    expect(result.title).toBe('テスト記事タイトル');
    expect(result.summary).toContain('概要の1行目');
    expect(result.category).toBe('投資');
  });

  test('タイトルがない場合はファイル名を使用する', () => {
    const content = `概要だけの記事です。`;
    const result = extractFromMarkdown(content, '世界情勢', '/path/to/記事.md');

    expect(result.title).toBe('記事');
    expect(result.category).toBe('世界情勢');
  });

  test('空のMarkdownでもエラーにならない', () => {
    const result = extractFromMarkdown('', '経済指標', 'empty.md');

    expect(result.title).toBe('empty');
    expect(result.summary).toBe('');
    expect(result.category).toBe('経済指標');
  });
});

describe('extractFromJson', () => {
  test('配列形式のJSONから記事を抽出できる', () => {
    const content = JSON.stringify([
      { title: '記事1', summary: '概要1' },
      { title: '記事2', summary: '概要2' },
    ]);
    const result = extractFromJson(content, '企業情報');

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('記事1');
    expect(result[0].summary).toBe('概要1');
    expect(result[0].category).toBe('企業情報');
  });

  test('オブジェクト形式のJSONから記事を抽出できる', () => {
    const content = JSON.stringify({ title: 'レポート', description: '詳細' });
    const result = extractFromJson(content, '背景知識');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('レポート');
  });

  test('不正なJSONの場合は空配列を返す', () => {
    const result = extractFromJson('不正なJSON', '投資');
    expect(result).toEqual([]);
  });

  test('10件以上の配列は10件に制限される', () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      title: `記事${i}`,
      summary: `概要${i}`,
    }));
    const result = extractFromJson(JSON.stringify(items), '投資');
    expect(result).toHaveLength(10);
  });
});

describe('collectFilesFromDir', () => {
  test('存在しないディレクトリは空配列を返す', () => {
    const result = collectFilesFromDir('/nonexistent/path');
    expect(result).toEqual([]);
  });

  test('Markdownとjsonファイルのみ収集する', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    fs.writeFileSync(path.join(tmpDir, 'test.md'), '# Test');
    fs.writeFileSync(path.join(tmpDir, 'data.json'), '{}');
    fs.writeFileSync(path.join(tmpDir, 'image.png'), 'binary');

    const result = collectFilesFromDir(tmpDir);

    expect(result).toHaveLength(2);
    expect(result.some((f) => f.endsWith('.md'))).toBe(true);
    expect(result.some((f) => f.endsWith('.json'))).toBe(true);
    expect(result.some((f) => f.endsWith('.png'))).toBe(false);

    fs.rmSync(tmpDir, { recursive: true });
  });

  test('node_modulesを除外する', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    const nmDir = path.join(tmpDir, 'node_modules');
    fs.mkdirSync(nmDir);
    fs.writeFileSync(path.join(nmDir, 'package.json'), '{}');
    fs.writeFileSync(path.join(tmpDir, 'real.md'), '# Real');

    const result = collectFilesFromDir(tmpDir);

    expect(result).toHaveLength(1);
    expect(result[0]).toContain('real.md');

    fs.rmSync(tmpDir, { recursive: true });
  });
});
