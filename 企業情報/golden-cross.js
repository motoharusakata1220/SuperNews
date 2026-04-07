export function calcMovingAverage(prices, period) {
  return prices.map((_, i) => {
    if (i < period - 1) return null;

    const slice = prices.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Math.round(sum / period * 100) / 100;
  });
}

export function detectGoldenCross(shortMa, longMa) {
  const crosses = [];

  for (let i = 1; i < shortMa.length; i++) {
    if (shortMa[i] === null || longMa[i] === null) continue;
    if (shortMa[i - 1] === null || longMa[i - 1] === null) continue;

    const prevBelow = shortMa[i - 1] <= longMa[i - 1];
    const nowAbove = shortMa[i] > longMa[i];

    if (prevBelow && nowAbove) {
      crosses.push(i);
    }
  }

  return crosses;
}

export function detectDeadCross(shortMa, longMa) {
  const crosses = [];

  for (let i = 1; i < shortMa.length; i++) {
    if (shortMa[i] === null || longMa[i] === null) continue;
    if (shortMa[i - 1] === null || longMa[i - 1] === null) continue;

    const prevAbove = shortMa[i - 1] >= longMa[i - 1];
    const nowBelow = shortMa[i] < longMa[i];

    if (prevAbove && nowBelow) {
      crosses.push(i);
    }
  }

  return crosses;
}
