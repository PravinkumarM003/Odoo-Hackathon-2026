import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// GET /api/hr/payroll — returns all employees, with or without a payroll record
export async function GET(req: NextRequest) {
  await requireHR(req);

  const [payrolls, allEmployees] = await Promise.all([
    prisma.payroll.findMany({
      include: {
        employee: {
          include: {
            user: { select: { name: true, employeeId: true, email: true } },
          },
        },
      },
    }),
    prisma.employee.findMany({
      include: {
        user: { select: { id: true, name: true, employeeId: true } },
      },
    }),
  ]);

  const payrollMap = new Map(payrolls.map(p => [p.employeeId, p]));

  // Combine: employees with payroll and employees without (unassigned)
  const result = allEmployees.map(emp => {
    const record = payrollMap.get(emp.userId);
    if (record) return { ...record, hasPayroll: true };
    return {
      id: null,
      employeeId: emp.userId,
      basic: 0,
      allowances: 0,
      deductions: 0,
      netSalary: 0,
      hasPayroll: false,
      employee: {
        user: { name: emp.user.name, employeeId: emp.user.employeeId },
      },
    };
  }).sort((a, b) => a.employee.user.name.localeCompare(b.employee.user.name));

  return apiSuccess(result);
}

// POST /api/hr/payroll — assign salary to an employee for the first time
export async function POST(req: NextRequest) {
  await requireHR(req);
  const { employeeId, basic, allowances, deductions } = await req.json();
  if (!employeeId || basic == null) return apiError("Missing fields", 400);

  const net = Number(basic) + Number(allowances) - Number(deductions);
  const record = await prisma.payroll.create({
    data: {
      employeeId,
      basic: Number(basic),
      allowances: Number(allowances ?? 0),
      deductions: Number(deductions ?? 0),
      netSalary: net,
    },
  });
  return apiSuccess(record);
}

