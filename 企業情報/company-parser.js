const DOC_TYPE_MAP = {
  '120': '有価証券報告書',
  '130': '四半期報告書',
  '140': '半期報告書',
  '150': '臨時報告書'
};

export function parseDocumentInfo(rawDoc) {
  const secCode = rawDoc.secCode ? rawDoc.secCode.slice(0, 4) : '';

  return {
    docId: rawDoc.docID,
    edinetCode: rawDoc.edinetCode,
    companyName: rawDoc.filerName,
    docType: DOC_TYPE_MAP[rawDoc.docTypeCode] || rawDoc.docTypeCode,
    description: rawDoc.docDescription,
    periodStart: rawDoc.periodStart,
    periodEnd: rawDoc.periodEnd,
    submitDate: rawDoc.submitDateTime,
    securityCode: secCode
  };
}

export function summarizeCompany(companyConfig, documents) {
  const sorted = [...documents].sort((a, b) =>
    a.submitDate > b.submitDate ? 1 : -1
  );

  return {
    code: companyConfig.code,
    name: companyConfig.name,
    edinetCode: companyConfig.edinetCode,
    totalDocuments: documents.length,
    latestSubmitDate: sorted.length > 0 ? sorted[sorted.length - 1].submitDate : null,
    documents: sorted
  };
}

export function formatCurrency(amount) {
  return `${amount.toLocaleString('ja-JP')}円`;
}
