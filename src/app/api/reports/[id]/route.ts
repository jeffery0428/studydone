import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.report.findFirst({
    where: { id, userId: user.id },
  });

  if (!report) {
    return NextResponse.json({ error: "报告不存在" }, { status: 404 });
  }

  const segments = JSON.parse(report.segmentResults) as Array<{
    text: string;
    aiProbability: number;
    riskLevel: string;
    explanation: string;
  }>;

  return NextResponse.json({
    report: {
      id: report.id,
      fileName: report.fileName,
      fileType: report.fileType,
      overallScore: report.overallScore,
      segments,
      createdAt: report.createdAt,
    },
  });
}
