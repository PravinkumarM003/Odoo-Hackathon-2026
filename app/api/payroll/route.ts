import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// GET /api/payroll
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const payroll = await prisma.payroll.findUnique({
    where: { employeeId: session.userId },
  });

  return apiSuccess(payroll);
}
