export class EdinetClient {
  constructor(baseUrl, subscriptionKey = '') {
    this.baseUrl = baseUrl;
    this.subscriptionKey = subscriptionKey;
  }

  async fetchDocumentList(date) {
    const url = `${this.baseUrl}/documents.json?date=${date}&type=2&Subscription-Key=${this.subscriptionKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`EDINET API エラー: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  filterByDocTypes(documents, docTypes) {
    return documents.filter((doc) => docTypes.includes(doc.docTypeCode));
  }

  async fetchDocumentListForRange(startDate, endDate) {
    const dates = generateDateRange(startDate, endDate);
    const results = [];

    for (const date of dates) {
      const docs = await this.fetchDocumentList(date);
      results.push(...docs);
    }

    return results;
  }
}

function generateDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
