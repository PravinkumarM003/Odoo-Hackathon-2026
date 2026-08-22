import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const earlyBirds = await prisma.attendance.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        checkIn: { not: null }
      },
      orderBy: { checkIn: "asc" },
      take: 3,
      include: {
        employee: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    const leaderboard = earlyBirds.map(a => ({
      id: a.employeeId,
      name: a.employee.user.name,
      checkIn: a.checkIn,
      designation: a.employee.designation
    }));

    const res = NextResponse.json(leaderboard);
    res.headers.set("Cache-Control", "private, max-age=120, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
