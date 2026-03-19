import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const project = await prisma.project.findFirst();
    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    const agents = await prisma.agent.findMany({
      where: { projectId: project.id },
      include: {
        _count: { select: { traces: true, spans: true } },
        outgoingConnections: {
          include: { targetAgent: { select: { name: true } } },
        },
        incomingConnections: {
          include: { sourceAgent: { select: { name: true } } },
        },
      },
    });

    const connections = await prisma.agentConnection.findMany({
      include: {
        sourceAgent: { select: { name: true, type: true } },
        targetAgent: { select: { name: true, type: true } },
      },
    });

    return NextResponse.json({ agents, connections });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
