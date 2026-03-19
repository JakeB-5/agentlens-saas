import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trace = await prisma.trace.findUnique({
      where: { id },
      include: {
        agent: true,
        spans: {
          orderBy: { startTime: "asc" },
          include: {
            agent: { select: { name: true, type: true } },
          },
        },
      },
    });

    if (!trace) {
      return NextResponse.json({ error: "Trace not found" }, { status: 404 });
    }

    return NextResponse.json(trace);
  } catch (error) {
    console.error("Get trace error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const trace = await prisma.trace.update({
      where: { id },
      data: {
        status: body.status,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        totalTokens: body.totalTokens,
        totalCost: body.totalCost,
      },
    });

    return NextResponse.json(trace);
  } catch (error) {
    console.error("Update trace error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
