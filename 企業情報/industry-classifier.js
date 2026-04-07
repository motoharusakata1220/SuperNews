export function classifyByIndustry(documents, industryMap) {
  const result = new Map();

  for (const doc of documents) {
    const info = industryMap.get(doc.edinetCode);
    const industry = info ? info.industry : 'その他・不明';

    if (!result.has(industry)) {
      result.set(industry, []);
    }
    result.get(industry).push({
      ...doc,
      companyName: info?.name || doc.edinetCode,
      securityCode: info?.securityCode || ''
    });
  }

  return result;
}

export function getIndustrySummary(classified) {
  const summary = [];

  for (const [industry, docs] of classified) {
    summary.push({ industry, count: docs.length });
  }

  return summary.sort((a, b) => b.count - a.count);
}
