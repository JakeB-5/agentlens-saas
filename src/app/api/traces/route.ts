import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const [traces, total] = await Promise.all([
      prisma.trace.findMany({
        where,
        orderBy: { startTime: "desc" },
        take: limit,
        skip: offset,
        include: {
          agent: { select: { name: true, type: true } },
          _count: { select: { spans: true } },
        },
      }),
      prisma.trace.count({ where }),
    ]);

    return NextResponse.json({ traces, total, limit, offset });
  } catch (error) {
    console.error("Traces API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await prisma.project.findFirst();
    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    const trace = await prisma.trace.create({
      data: {
        name: body.name,
        status: body.status ?? "running",
        projectId: project.id,
        agentId: body.agentId,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });

    return NextResponse.json(trace, { status: 201 });
  } catch (error) {
    console.error("Create trace error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
