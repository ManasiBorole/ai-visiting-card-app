import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { buildExportFilename } from "@/lib/import-export/mappers";
import {
  buildCsvBuffer,
  buildExcelBuffer,
  buildImportTemplateBuffer,
  getExportContacts,
} from "@/services/import-export.service";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "xlsx";
    const template = searchParams.get("template") === "true";

    if (template) {
      const buffer = buildImportTemplateBuffer();
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="visiting-cards-template.xlsx"`,
        },
      });
    }

    const contacts = await getExportContacts(session.user.id);
    const filename = buildExportFilename(format === "csv" ? "csv" : "xlsx");

    if (format === "csv") {
      const buffer = buildCsvBuffer(contacts);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "xlsx" || format === "excel") {
      const buffer = buildExcelBuffer(contacts);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported export format" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to export contacts" },
      { status: 500 }
    );
  }
}
