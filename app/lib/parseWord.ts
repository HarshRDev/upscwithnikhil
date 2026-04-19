import * as mammoth from "mammoth";

/**
 * Parses a Word document and extracts MCQs
 * Expected format in Word document:
 * 
 * Q1: What is the capital of India?
 * A) Mumbai
 * B) New Delhi
 * C) Kolkata
 * D) Bangalore
 * Answer: B
 * Explanation: New Delhi is the capital of India
 * 
 * Q2: How many states...
 */

interface ExtractedMCQ {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

export async function parseWordFile(file: File): Promise<ExtractedMCQ[]> {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to convert DOCX to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Extract text from HTML
    const textContent = html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

    // Parse MCQs from text
    const mcqs = extractMCQsFromText(textContent);
    
    if (mcqs.length === 0) {
      throw new Error(
        "No MCQs found. Please ensure format: Q1: Question\\nA) Option\\nAnswer: X"
      );
    }

    return mcqs;
  } catch (error) {
    throw new Error(
      `Failed to parse Word file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function extractMCQsFromText(text: string): ExtractedMCQ[] {
  const mcqs: ExtractedMCQ[] = [];

  // Split by question pattern (Q1:, Q2:, etc. or Question 1:, etc.)
  const questionPattern = /(?:^|\n)(Q|Question)\s*(\d+)\s*:?\s*(.+?)(?=(?:^|\n)(?:Q|Question)\s*\d+|$)/gis;
  
  let match;
  while ((match = questionPattern.exec(text)) !== null) {
    try {
      const questionBlock = match[3];
      
      // Extract question text (first line after Q number)
      const lines = questionBlock.split("\n").filter((l) => l.trim());
      
      if (lines.length < 6) {
        // Need at least: question + 4 options + answer
        continue;
      }

      const question = lines[0].trim();

      // Extract options
      const optionA = extractOption(lines, "A|1");
      const optionB = extractOption(lines, "B|2");
      const optionC = extractOption(lines, "C|3");
      const optionD = extractOption(lines, "D|4");

      if (!optionA || !optionB || !optionC || !optionD) {
        continue;
      }

      // Extract correct answer
      const correctAnswerMatch = questionBlock.match(
        /(?:Answer|Correct Answer|Ans)\s*:?\s*([A-Da-d1-4])/i
      );
      const correctAnswer = correctAnswerMatch
        ? correctAnswerMatch[1].toUpperCase()
        : "";

      if (!["A", "B", "C", "D", "1", "2", "3", "4"].includes(correctAnswer)) {
        continue;
      }

      // Convert numeric answers to letters
      const answerMap: { [key: string]: string } = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
      };
      const normalizedAnswer = answerMap[correctAnswer] || correctAnswer;

      // Extract explanation (optional)
      const explanationMatch = questionBlock.match(
        /(?:Explanation|Explain|Note)\s*:?\s*(.+?)(?:(?:^|\n)Q|$)/is
      );
      const explanation = explanationMatch
        ? explanationMatch[1].trim()
        : undefined;

      mcqs.push({
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: normalizedAnswer,
        explanation: explanation || undefined,
      });
    } catch (error) {
      // Skip malformed questions
      continue;
    }
  }

  return mcqs;
}

function extractOption(lines: string[], pattern: string): string {
  const regex = new RegExp(`^\\s*[${pattern}]\\)\\s*(.+)$`, "i");

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      return match[1].trim();
    }
  }

  return "";
}
