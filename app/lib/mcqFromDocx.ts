export interface ExtractedMCQ {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

/** HTML from mammoth → plain text with paragraph / list boundaries preserved */
export function htmlToPlainText(html: string): string {
  const textContent = html
    .replace(/<\/p>/g, "\n")
    .replace(/<\/li>/g, "\n")
    .replace(/<ul>|<ol>/g, "")
    .replace(/<\/ul>|<\/ol>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  return textContent;
}

function extractOption(lines: string[], letter: string): string {
  const regex = new RegExp(`^\\s*${letter}\\)\\s*(.+)$`, "i");
  for (const line of lines) {
    const match = line.match(regex);
    if (match) return match[1].trim();
  }
  return "";
}

/** Q1: / Question 1: style blocks */
function extractMCQsQStyle(text: string): ExtractedMCQ[] {
  const mcqs: ExtractedMCQ[] = [];
  const questionPattern =
    /(?:^|\n)(?:Q|Question)\s*(\d+)\s*:?\s*([\s\S]+?)(?=(?:^|\n)(?:Q|Question)\s*\d+|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = questionPattern.exec(text)) !== null) {
    try {
      const block = match[2];
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

      if (lines.length < 5) continue;

      const question = lines[0];
      const optionA = extractOption(lines, "A") || extractOption(lines, "1");
      const optionB = extractOption(lines, "B") || extractOption(lines, "2");
      const optionC = extractOption(lines, "C") || extractOption(lines, "3");
      const optionD = extractOption(lines, "D") || extractOption(lines, "4");

      if (!optionA || !optionB || !optionC || !optionD) continue;

      const correctAnswerMatch = block.match(
        /(?:Answer|Correct Answer|Ans)\s*:?\s*([A-Da-d1-4])/i
      );
      const raw = correctAnswerMatch?.[1]?.toUpperCase() ?? "";
      if (!raw) continue;

      const answerMap: Record<string, string> = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
      };
      const normalized = answerMap[raw] ?? raw;
      if (!["A", "B", "C", "D"].includes(normalized)) continue;

      const explanationMatch = block.match(
        /(?:Explanation|Explain|Note)\s*:?\s*([\s\S]+?)(?=(?:^|\n)(?:Q|Question)\s*\d+|$)/i
      );
      const explanation = explanationMatch?.[1]?.trim();

      mcqs.push({
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: normalized,
        explanation: explanation || undefined,
      });
    } catch {
      continue;
    }
  }

  return mcqs;
}

/** 1. Question … / a) options / Answer: A — numbered questions */
function extractMCQsNumbered(text: string): ExtractedMCQ[] {
  const mcqs: ExtractedMCQ[] = [];
  const questionBlocks = text.split(/\n\d+\.\s+/).slice(1);

  for (const block of questionBlocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 5) continue;

    const question = lines[0];
    const optionMap: Record<string, string> = {};

    for (const line of lines) {
      const m = line.match(/^([a-d])\)\s*(.+)/i);
      if (m) optionMap[m[1].toUpperCase()] = m[2];
    }

    const required = ["A", "B", "C", "D"] as const;
    if (required.some((k) => !optionMap[k])) continue;

    let answer = "";
    for (const line of lines) {
      if (/answer\s*:/i.test(line)) {
        const am = line.match(/answer:\s*([a-d])/i);
        if (am) {
          answer = am[1].toUpperCase();
          break;
        }
      }
    }

    if (!["A", "B", "C", "D"].includes(answer)) continue;

    let explanation: string | undefined;
    const explLine = lines.find((l) => /^(explanation|explain|note)\s*:/i.test(l));
    if (explLine) {
      explanation = explLine.replace(/^(explanation|explain|note)\s*:\s*/i, "").trim();
    }

    mcqs.push({
      question,
      option_a: optionMap.A,
      option_b: optionMap.B,
      option_c: optionMap.C,
      option_d: optionMap.D,
      correct_answer: answer,
      explanation,
    });
  }

  return mcqs;
}

/** Normalize Q1: / Question 1: prefixes to "1. " so numbered parser can run */
function normalizeQNumbering(text: string): string {
  return text.replace(
    /(^|\n)\s*(?:Q|Question)\s*(\d+)\s*:\s*/gi,
    (_m, pre: string, num: string) => `${pre}${num}. `
  );
}

export function extractMCQsFromPlainText(text: string): ExtractedMCQ[] {
  const q = extractMCQsQStyle(text);
  if (q.length > 0) return q;

  const numbered = extractMCQsNumbered(normalizeQNumbering(text));
  if (numbered.length > 0) return numbered;

  return extractMCQsNumbered(text);
}
