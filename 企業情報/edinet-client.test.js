import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EdinetClient } from './edinet-client.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('EdinetClient', () => {
  let client;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new EdinetClient('https://api.edinet-fsa.go.jp/api/v2');
  });

  describe('fetchDocumentList', () => {
    it('指定日の全書類一覧を取得できる', async () => {
      const mockResults = [
        { docID: 'S1', edinetCode: 'E02144', filerName: 'トヨタ', docTypeCode: '120' },
        { docID: 'S2', edinetCode: 'E01777', filerName: 'ソニー', docTypeCode: '130' },
        { docID: 'S3', edinetCode: 'E99999', filerName: '非上場企業', docTypeCode: '120' }
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ metadata: { status: '200' }, results: mockResults })
      });

      const result = await client.fetchDocumentList('2026-04-01');

      expect(result).toHaveLength(3);
    });

    it('Subscription Key がURLに含まれる', async () => {
      const clientWithKey = new EdinetClient('https://api.edinet-fsa.go.jp/api/v2', 'my-key');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ metadata: { status: '200' }, results: [] })
      });

      await clientWithKey.fetchDocumentList('2026-04-01');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.edinet-fsa.go.jp/api/v2/documents.json?date=2026-04-01&type=2&Subscription-Key=my-key'
      );
    });

    it('APIエラーのとき エラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(client.fetchDocumentList('2026-04-01')).rejects.toThrow('EDINET API エラー: 500');
    });

    it('results が undefined のとき空配列を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ metadata: { status: '200' } })
      });
      const result = await client.fetchDocumentList('2026-04-01');
      expect(result).toEqual([]);
    });
  });

  describe('filterByDocTypes', () => {
    it('指定した書類種別のみフィルタできる', () => {
      const documents = [
        { docID: 'S1', docTypeCode: '120' },
        { docID: 'S2', docTypeCode: '130' },
        { docID: 'S3', docTypeCode: '999' }
      ];
      const result = client.filterByDocTypes(documents, ['120', '130']);
      expect(result).toHaveLength(2);
    });
  });

  describe('fetchDocumentListForRange', () => {
    it('日付範囲で全書類を取得できる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          metadata: { status: '200' },
          results: [{ docID: 'S1', docTypeCode: '120' }]
        })
      });

      const result = await client.fetchDocumentListForRange('2026-04-01', '2026-04-03');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });
  });
});
