import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: traceId } = await params;
    const body = await request.json();

    // Verify trace exists
    const trace = await prisma.trace.findUnique({ where: { id: traceId } });
    if (!trace) {
      return NextResponse.json({ error: "Trace not found" }, { status: 404 });
    }

    // Resolve agent by name if provided
    let agentId = body.agentId ?? null;
    if (!agentId && body.agentName) {
      const agent = await prisma.agent.findFirst({
        where: { name: body.agentName, projectId: trace.projectId },
      });
      agentId = agent?.id ?? null;
    }

    const span = await prisma.span.create({
      data: {
        name: body.name,
        type: body.type,
        status: body.status ?? "completed",
        startTime: body.startTime ? new Date(body.startTime) : new Date(),
        endTime: body.endTime ? new Date(body.endTime) : null,
        tokens: body.tokens ?? 0,
        cost: body.cost ?? 0,
        model: body.model ?? null,
        latencyMs: body.latencyMs ?? null,
        traceId,
        agentId,
        input: body.input ?? null,
        output: body.output ?? null,
      },
    });

    return NextResponse.json(span, { status: 201 });
  } catch (error) {
    console.error("Create span error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
