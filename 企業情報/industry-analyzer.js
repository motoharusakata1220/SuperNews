import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function buildAnalysisPrompt(industryName, documents, goldenCrossStocks) {
  const companyList = documents
    .map((d) => `- ${d.companyName}: ${d.docType}（${d.description}）`)
    .join('\n');

  const gcList = goldenCrossStocks.length > 0
    ? goldenCrossStocks.map((s) => `- ${s.name}（${s.code}）`).join('\n')
    : 'なし';

  return `以下は「${industryName}」業界の最新の決算書類提出状況とテクニカル指標です。

## 提出された決算書類
${companyList}

## ゴールデンクロス銘柄: ${goldenCrossStocks.length > 0 ? '' : 'なし'}
${goldenCrossStocks.length > 0 ? gcList : ''}

上記の情報をもとに、以下を簡潔に分析してください:
1. この業界の現在の状況と傾向
2. 大きな転換点となりうる要素
3. 注目すべき企業とその理由
4. ゴールデンクロス銘柄がある場合、その技術的意味

日本語で500文字以内で回答してください。`;
}

export function parseAnalysisResult(text) {
  if (!text || !text.trim()) {
    return '分析結果を取得できませんでした。';
  }
  return text.trim();
}

export async function analyzeIndustry(industryName, documents, goldenCrossStocks, execFn) {
  const prompt = buildAnalysisPrompt(industryName, documents, goldenCrossStocks);
  const executor = execFn || defaultExec;

  try {
    const { stdout } = await executor('claude', ['-p', prompt], {
      timeout: 60000
    });
    return parseAnalysisResult(stdout);
  } catch {
    return '分析結果を取得できませんでした。';
  }
}

async function defaultExec(command, args, options) {
  return execFileAsync(command, args, options);
}
