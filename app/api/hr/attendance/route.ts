import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess } from "@/lib/guards";

// GET /api/hr/attendance?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  await requireHR(req);

  const dateParam = req.nextUrl.searchParams.get("date");
  let date: Date;
  if (dateParam) {
    date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
  } else {
    date = new Date();
    date.setHours(0, 0, 0, 0);
  }

  const records = await prisma.attendance.findMany({
    where: {
      date: { gte: date, lt: new Date(date.getTime() + 86400000) },
    },
    include: {
      employee: {
        include: { user: { select: { name: true, employeeId: true } } },
      },
    },
    orderBy: { employee: { user: { name: "asc" } } },
  });

  return apiSuccess(records);
}
