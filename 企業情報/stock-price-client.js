export function parseStooqCsv(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return {
      date: cols[0],
      close: parseFloat(cols[4])
    };
  });
}

export async function fetchStockPrices(securityCode) {
  // stooq.com の無料CSVエンドポイント
  // 日本株は証券コード + .JP
  const symbol = `${securityCode}.jp`;
  const url = `https://stooq.com/q/d/l/?s=${symbol}&i=d`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];

    const text = await response.text();
    return parseStooqCsv(text);
  } catch {
    return [];
  }
}
