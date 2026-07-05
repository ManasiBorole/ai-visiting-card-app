import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { importContactsFromFile } from "@/services/import-export.service";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Please upload a CSV or Excel file" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importContactsFromFile(
      session.user.id,
      buffer,
      file.name
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Imported ${result.imported} of ${result.totalRows} contacts`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to import contacts" },
      { status: 500 }
    );
  }
}
