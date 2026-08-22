import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/guards";

// GET /api/attendance?days=14
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "14");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.attendance.findMany({
    where: {
      employeeId: session.userId,
      date: { gte: since },
    },
    orderBy: { date: "desc" },
  });

  return apiSuccess(records);
}
