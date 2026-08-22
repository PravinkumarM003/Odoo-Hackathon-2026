import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireHR, apiSuccess } from "@/lib/guards";

// GET /api/workblocks/[employeeId]
export async function GET(
  req: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  const session = await requireAuth(req);

  // HR can view anyone; Employee can only view their own
  if (session.role !== "HR" && session.userId !== params.employeeId) {
    return apiSuccess([], 403);
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  let date: Date;
  if (dateParam) {
    date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
  } else {
    date = new Date();
    date.setHours(0, 0, 0, 0);
  }

  const blocks = await prisma.workBlock.findMany({
    where: {
      employeeId: params.employeeId,
      date: { gte: date, lt: new Date(date.getTime() + 86400000) },
    },
    orderBy: { startTime: "asc" },
  });

  return apiSuccess(blocks);
}
