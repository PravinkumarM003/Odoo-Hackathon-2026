import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess } from "@/lib/guards";

// GET /api/hr/leaves?status=PENDING
export async function GET(req: NextRequest) {
  await requireHR(req);

  const statusParam = req.nextUrl.searchParams.get("status");
  const where = statusParam ? { status: statusParam as "PENDING" | "APPROVED" | "REJECTED" } : {};

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: {
      employee: {
        include: {
          user: { select: { name: true, employeeId: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(leaves);
}
