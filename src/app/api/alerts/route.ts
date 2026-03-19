import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const project = await prisma.project.findFirst();
    if (!project) {
      return NextResponse.json({ error: "No project found" }, { status: 404 });
    }

    const alerts = await prisma.alert.findMany({
      where: { projectId: project.id },
      include: {
        events: {
          orderBy: { triggeredAt: "desc" },
          take: 5,
        },
        _count: { select: { events: true } },
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Alerts API error:", error);
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

    const alert = await prisma.alert.create({
      data: {
        name: body.name,
        type: body.type,
        condition: body.condition ?? "gt",
        threshold: body.threshold,
        window: body.window ?? 300,
        projectId: project.id,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("Create alert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
