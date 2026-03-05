import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractText, segmentText, type SupportedFormat } from "@/lib/document";
import { analyzeText } from "@/lib/ai-detector";

const ALLOWED_TYPES = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf", "text/plain"];
const EXT_MAP: Record<string, SupportedFormat> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/pdf": "pdf",
  "text/plain": "txt",
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (user.checkQuota <= 0) {
      return NextResponse.json(
        { error: "查重次数已用完，请购买更多次数" },
        { status: 402 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    const mime = file.type;
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: "仅支持 docx、pdf、txt 格式" },
        { status: 400 }
      );
    }

    const format = EXT_MAP[mime];
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractText(buffer, format);
    if (!rawText || rawText.length < 50) {
      return NextResponse.json(
        { error: "文档内容过少，无法分析" },
        { status: 400 }
      );
    }

    const segments = segmentText(rawText);
    const result = analyzeText(segments);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { checkQuota: { decrement: 1 } },
      }),
      prisma.report.create({
        data: {
          userId: user.id,
          fileName: file.name,
          fileType: format,
          overallScore: result.overallScore,
          rawText: rawText.slice(0, 50000),
          segmentResults: JSON.stringify(result.segments),
        },
      }),
    ]);

    return NextResponse.json({
      report: {
        overallScore: result.overallScore,
        segments: result.segments,
        fileName: file.name,
      },
      remainingQuota: user.checkQuota - 1,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "分析失败，请重试" },
      { status: 500 }
    );
  }
}
