import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { analyzeContactFields } from "@/services/ai.service";

const analyzeSchema = z.object({
  contact: z.object({
    name: z.string().optional(),
    company: z.string().optional(),
    designation: z.string().optional(),
    mobile: z.string().optional(),
    alternateMobile: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    gstNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
  excludeId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const input = analyzeSchema.parse(body);
    const analysis = await analyzeContactFields(
      session.user.id,
      input.contact,
      input.excludeId
    );

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid contact payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to analyze contact" },
      { status: 500 }
    );
  }
}
