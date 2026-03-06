import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const reports = await this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        fileName: true,
        fileType: true,
        overallScore: true,
        createdAt: true,
      },
    });
    return { reports };
  }

  async detail(userId: string, id: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, userId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        overallScore: true,
        segmentResults: true,
        bibliographyScan: true,
        createdAt: true,
      },
    });
    if (!report) throw new NotFoundException("Report not found");
    return {
      report: {
        ...report,
        segments: report.segmentResults,
        bibliographyScan: report.bibliographyScan ?? undefined,
      },
    };
  }
}

