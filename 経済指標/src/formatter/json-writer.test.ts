import { writeFrequencyFiles } from './json-writer';
import * as fs from 'fs';
import * as path from 'path';
import { FrequencyGrouped, EconomicIndicator } from '../types';

// ファイルI/Oをモック（外部依存）
jest.mock('fs');
const mockFs = jest.mocked(fs);

const makeIndicator = (overrides: Partial<EconomicIndicator>): EconomicIndicator => ({
  country: 'Japan',
  countryCode: 'JP',
  indicator: 'テスト指標',
  indicatorCode: 'TEST',
  value: 100,
  date: '2024',
  source: 'WorldBank',
  frequency: '年次',
  unit: '%',
  ...overrides,
});

describe('writeFrequencyFiles', () => {
  beforeEach(() => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.writeFileSync.mockReturnValue(undefined);
  });

  test('更新頻度別に4つのJSONファイルを出力する', () => {
    const data: FrequencyGrouped = {
      '日次': [makeIndicator({ frequency: '日次' })],
      '月次': [makeIndicator({ frequency: '月次' })],
      '四半期': [],
      '年次': [makeIndicator({ frequency: '年次' })],
    };

    writeFrequencyFiles(data, '/tmp/output');

    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(4);

    const calls = mockFs.writeFileSync.mock.calls;
    const filePaths = calls.map((c) => c[0] as string);

    expect(filePaths).toContain(path.join('/tmp/output', '日次指標.json'));
    expect(filePaths).toContain(path.join('/tmp/output', '月次指標.json'));
    expect(filePaths).toContain(path.join('/tmp/output', '四半期指標.json'));
    expect(filePaths).toContain(path.join('/tmp/output', '年次指標.json'));
  });

  test('出力ディレクトリが存在しない場合は作成する', () => {
    mockFs.existsSync.mockReturnValue(false);

    const data: FrequencyGrouped = {
      '日次': [],
      '月次': [],
      '四半期': [],
      '年次': [],
    };

    writeFrequencyFiles(data, '/tmp/new-output');

    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/tmp/new-output', { recursive: true });
  });

  test('出力されるJSONにメタデータが含まれる', () => {
    const data: FrequencyGrouped = {
      '日次': [makeIndicator({ frequency: '日次' })],
      '月次': [],
      '四半期': [],
      '年次': [],
    };

    writeFrequencyFiles(data, '/tmp/output');

    const dailyCall = mockFs.writeFileSync.mock.calls.find(
      (c) => (c[0] as string).includes('日次指標')
    );
    expect(dailyCall).toBeDefined();

    const written = JSON.parse(dailyCall![1] as string);
    expect(written).toHaveProperty('generatedAt');
    expect(written).toHaveProperty('frequency', '日次');
    expect(written).toHaveProperty('count', 1);
    expect(written).toHaveProperty('data');
    expect(written.data).toHaveLength(1);
  });
});
