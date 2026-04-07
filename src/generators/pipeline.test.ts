import { extractJson } from './pipeline';

describe('extractJson', () => {
  test('JSONブロックからデータを抽出できる', () => {
    const raw = `テキスト
\`\`\`json
{"key": "value", "num": 42}
\`\`\`
テキスト`;
    const result = extractJson<{ key: string; num: number }>(raw);

    expect(result.key).toBe('value');
    expect(result.num).toBe(42);
  });

  test('直接のJSONオブジェクトから抽出できる', () => {
    const raw = `何かのテキスト {"title": "テスト", "items": [1, 2, 3]} 後のテキスト`;
    const result = extractJson<{ title: string; items: number[] }>(raw);

    expect(result.title).toBe('テスト');
    expect(result.items).toEqual([1, 2, 3]);
  });

  test('ネストされたJSONを正しく抽出できる', () => {
    const raw = `\`\`\`json
{
  "niches": [
    {
      "nicheName": "投資",
      "competition": { "difficultyLevel": "中" }
    }
  ]
}
\`\`\``;
    const result = extractJson<{ niches: Array<{ nicheName: string }> }>(raw);

    expect(result.niches).toHaveLength(1);
    expect(result.niches[0].nicheName).toBe('投資');
  });

  test('JSONがない場合はエラーを投げる', () => {
    expect(() => extractJson('JSONではないテキスト')).toThrow(
      'JSON出力の抽出に失敗しました',
    );
  });

  test('不正なJSONの場合はパースエラーを投げる', () => {
    const raw = '```json\n{invalid json}\n```';
    expect(() => extractJson(raw)).toThrow();
  });
});
