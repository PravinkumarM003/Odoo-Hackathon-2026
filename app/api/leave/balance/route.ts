import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// GET /api/leave/balance
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);

  const approved = await prisma.leaveRequest.findMany({
    where: {
      employeeId: session.userId,
      status: "APPROVED",
      startDate: { gte: yearStart },
    },
  });

  const used: Record<string, number> = {};
  for (const leave of approved) {
    const days =
      Math.ceil(
        (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    used[leave.type] = (used[leave.type] ?? 0) + days;
  }

  return apiSuccess({
    annual: { total: 21, used: used["Annual"] ?? 0, remaining: 21 - (used["Annual"] ?? 0) },
    sick: { total: 14, used: used["Sick"] ?? 0, remaining: 14 - (used["Sick"] ?? 0) },
    personal: { total: 5, used: used["Personal"] ?? 0, remaining: 5 - (used["Personal"] ?? 0) },
  });
}
