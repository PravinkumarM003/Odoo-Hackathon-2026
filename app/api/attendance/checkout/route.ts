import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/guards";

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  const today = todayDate();

  const existing = await prisma.attendance.findFirst({
    where: {
      employeeId: session.userId,
      date: { gte: today, lt: new Date(today.getTime() + 86400000) },
    },
  });

  if (!existing?.checkIn) {
    return apiError("You haven't checked in today", 400);
  }

  if (existing.checkOut) {
    return apiError("Already checked out today", 400);
  }

  const record = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  });

  return apiSuccess(record);
}
