import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const project = await prisma.project.findFirst();
    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    const [
      totalTraces,
      activeAgents,
      failedTraces,
      totalCost,
      recentTraces,
      agentStats,
      tracesByHour,
    ] = await Promise.all([
      prisma.trace.count({ where: { projectId: project.id } }),
      prisma.agent.count({ where: { projectId: project.id, status: "active" } }),
      prisma.trace.count({ where: { projectId: project.id, status: "failed" } }),
      prisma.trace.aggregate({
        where: { projectId: project.id },
        _sum: { totalCost: true },
      }),
      prisma.trace.findMany({
        where: { projectId: project.id },
        orderBy: { startTime: "desc" },
        take: 10,
        include: { agent: { select: { name: true, type: true } } },
      }),
      prisma.agent.findMany({
        where: { projectId: project.id },
        include: {
          _count: { select: { traces: true, spans: true } },
        },
      }),
      prisma.trace.groupBy({
        by: ["status"],
        where: { projectId: project.id },
        _count: true,
      }),
    ]);

    const errorRate = totalTraces > 0 ? (failedTraces / totalTraces) * 100 : 0;

    // Calculate avg latency from completed traces
    const completedTraces = await prisma.trace.findMany({
      where: { projectId: project.id, status: "completed", endTime: { not: null } },
      select: { startTime: true, endTime: true },
    });

    const avgLatency =
      completedTraces.length > 0
        ? completedTraces.reduce((sum, t) => {
            return sum + (t.endTime!.getTime() - t.startTime.getTime());
          }, 0) / completedTraces.length
        : 0;

    // Token usage by agent
    const tokensByAgent = await prisma.span.groupBy({
      by: ["agentId"],
      _sum: { tokens: true, cost: true },
      where: { agentId: { not: null } },
    });

    return NextResponse.json({
      overview: {
        totalTraces,
        activeAgents,
        errorRate: errorRate.toFixed(1),
        totalCost: totalCost._sum.totalCost ?? 0,
        avgLatency: Math.round(avgLatency),
      },
      recentTraces,
      agentStats,
      tracesByStatus: tracesByHour,
      tokensByAgent,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
