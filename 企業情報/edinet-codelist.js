export function parseCodeListCsv(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  // ヘッダーをスキップ
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      edinetCode: cols[0],
      name: cols[6],
      securityCode: cols[11],
      industry: cols[10],
      listingStatus: cols[2],
      capital: cols[4]
    };
  });
}

export function buildIndustryMap(companies) {
  const map = new Map();

  for (const company of companies) {
    if (company.listingStatus !== '上場') continue;

    map.set(company.edinetCode, {
      name: company.name,
      securityCode: company.securityCode,
      industry: company.industry
    });
  }

  return map;
}

export async function fetchCodeList(baseUrl, subscriptionKey) {
  const url = `${baseUrl}/EdinetcodeDlInfo.json?Subscription-Key=${subscriptionKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`EDINETコードリスト取得エラー: ${response.status}`);
  }

  // APIはZIPファイルを返す — 呼び出し側で解凍処理を行う
  const buffer = await response.arrayBuffer();
  return buffer;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}
