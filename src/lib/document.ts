import mammoth from "mammoth";
import pdf from "pdf-parse";

export type SupportedFormat = "docx" | "pdf" | "txt";

export async function extractText(
  buffer: Buffer,
  format: SupportedFormat
): Promise<string> {
  switch (format) {
    case "docx":
      return extractFromDocx(buffer);
    case "pdf":
      return extractFromPdf(buffer);
    case "txt":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text.trim();
}

export function segmentText(text: string): string[] {
  const segments: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (trimmed.length < 20) continue;
    segments.push(trimmed);
  }

  if (segments.length === 0 && text.trim().length > 0) {
    const chunks = text.match(/.{1,200}/g) || [text];
    segments.push(...chunks.filter((c) => c.trim().length > 20));
  }

  return segments;
}
