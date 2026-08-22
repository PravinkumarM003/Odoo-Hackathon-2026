import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// GET /api/hr/payroll
export async function GET(req: NextRequest) {
  await requireHR(req);

  const payrolls = await prisma.payroll.findMany({
    include: {
      employee: {
        include: {
          user: { select: { name: true, employeeId: true, email: true } },
        },
      },
    },
    orderBy: { employee: { user: { name: "asc" } } },
  });

  return apiSuccess(payrolls);
}
