import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// GET /api/workblocks?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
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
      employeeId: session.userId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 86400000),
      },
    },
    orderBy: { startTime: "asc" },
  });

  return apiSuccess(blocks);
}
