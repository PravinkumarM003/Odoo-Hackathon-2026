import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "HR") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { title, content, priority } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || "NORMAL",
        authorId: user.id,
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
