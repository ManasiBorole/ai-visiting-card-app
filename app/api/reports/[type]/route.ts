import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  generatePdfReport,
  PDF_REPORT_TYPES,
  type PdfReportType,
} from "@/services/pdf-report.service";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type } = await context.params;

    if (!PDF_REPORT_TYPES.includes(type as PdfReportType)) {
      return NextResponse.json(
        { success: false, error: "Unsupported report type" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    const report = await generatePdfReport(
      type as PdfReportType,
      {
        userId: session.user.id,
        userName: session.user.name,
      },
      month
    );

    return new NextResponse(new Uint8Array(report.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
