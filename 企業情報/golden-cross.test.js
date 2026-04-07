import { describe, it, expect } from 'vitest';
import { calcMovingAverage, detectGoldenCross, detectDeadCross } from './golden-cross.js';

describe('calcMovingAverage', () => {
  it('指定期間の移動平均を計算する', () => {
    const prices = [100, 110, 120, 130, 140];
    const result = calcMovingAverage(prices, 3);

    // MA(3): [null, null, 110, 120, 130]
    expect(result).toEqual([null, null, 110, 120, 130]);
  });

  it('データが期間より短いとき全てnullを返す', () => {
    const prices = [100, 110];
    const result = calcMovingAverage(prices, 5);
    expect(result).toEqual([null, null]);
  });

  it('期間1のとき元の値をそのまま返す', () => {
    const prices = [100, 200, 300];
    const result = calcMovingAverage(prices, 1);
    expect(result).toEqual([100, 200, 300]);
  });
});

describe('detectGoldenCross', () => {
  it('短期MAが長期MAを下から上に抜けたときゴールデンクロスを検出する', () => {
    // 短期MAが長期MAの下にいた状態から上に抜ける
    const shortMa = [null, null, 95, 98, 100, 105, 110];
    const longMa =  [null, null, null, null, 100, 102, 103];

    const result = detectGoldenCross(shortMa, longMa);

    // index 5で短期(105) > 長期(102)、かつindex 4で短期(100) <= 長期(100)
    expect(result).toContain(5);
  });

  it('ゴールデンクロスがないとき空配列を返す', () => {
    const shortMa = [null, null, 110, 115, 120];
    const longMa =  [null, null, null, null, 100];

    // shortが常にlongの上なのでクロスしない
    const result = detectGoldenCross(shortMa, longMa);
    expect(result).toEqual([]);
  });
});

describe('detectDeadCross', () => {
  it('短期MAが長期MAを上から下に抜けたときデッドクロスを検出する', () => {
    const shortMa = [null, null, 110, 105, 100, 95, 90];
    const longMa =  [null, null, null, null, 100, 100, 100];

    const result = detectDeadCross(shortMa, longMa);

    // index 5で短期(95) < 長期(100)、かつindex 4で短期(100) >= 長期(100)
    expect(result).toContain(5);
  });
});
