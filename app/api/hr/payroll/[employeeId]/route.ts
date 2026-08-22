import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// GET /api/hr/payroll/[employeeId]
export async function GET(
  req: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  await requireHR(req);

  const payroll = await prisma.payroll.findUnique({
    where: { employeeId: params.employeeId },
    include: {
      employee: {
        include: { user: { select: { name: true, employeeId: true } } },
      },
    },
  });

  if (!payroll) return apiError("Payroll record not found", 404);
  return apiSuccess(payroll);
}

// PUT /api/hr/payroll/[employeeId]
export async function PUT(
  req: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  await requireHR(req);

  const { basic, allowances, deductions } = await req.json();

  if (
    typeof basic !== "number" ||
    typeof allowances !== "number" ||
    typeof deductions !== "number"
  ) {
    return apiError("Invalid payroll data — basic, allowances, deductions must be numbers", 400);
  }

  if (basic < 0 || allowances < 0 || deductions < 0) {
    return apiError("Payroll values cannot be negative", 400);
  }

  const netSalary = basic + allowances - deductions;

  const updated = await prisma.payroll.upsert({
    where: { employeeId: params.employeeId },
    update: { basic, allowances, deductions, netSalary },
    create: { employeeId: params.employeeId, basic, allowances, deductions, netSalary },
  });

  return apiSuccess(updated);
}
