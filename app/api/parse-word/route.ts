import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import {
  extractMCQsFromPlainText,
  htmlToPlainText,
} from "../../lib/mcqFromDocx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string | null)?.toLowerCase() || "mcq";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (mode === "article") {
      const titleOverride = (formData.get("article_title") as string | null)?.trim();
      const result = await mammoth.extractRawText({ buffer });
      const raw = result.value.replace(/\r\n/g, "\n").trim();
      if (!raw) {
        return NextResponse.json(
          { error: "No text found in document" },
          { status: 400 }
        );
      }
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      const title =
        titleOverride ||
        lines[0] ||
        file.name.replace(/\.(docx|doc)$/i, "") ||
        "Untitled";
      const content = titleOverride ? raw : lines.slice(1).join("\n\n") || raw;
      return NextResponse.json({ title, content });
    }

    const result = await mammoth.convertToHtml({ buffer });
    const textContent = htmlToPlainText(result.value);
    const mcqs = extractMCQsFromPlainText(textContent);

    if (mcqs.length === 0) {
      return NextResponse.json(
        {
          error: "No MCQs found",
          details: "Could not parse MCQs from document",
          extractedTextSample: textContent.substring(0, 2000),
          textLength: textContent.length,
          suggestions: [
            "Use Q1: Question text then A) B) C) D) and Answer: B (or 1. question with a) options)",
            "Include Answer: A (letter) on its own line",
            "Optional: Explanation: … on the following line",
          ],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ mcqs, count: mcqs.length });
  } catch (error) {
    console.error("Word parsing error:", error);
    return NextResponse.json(
      {
        error: `Failed to parse Word file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
