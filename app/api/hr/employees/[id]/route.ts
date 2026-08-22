import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// GET /api/hr/employees/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireHR(req);

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      employee: {
        include: {
          attendance: {
            orderBy: { date: "desc" },
            take: 10,
          },
          leaveRequests: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          payroll: true,
          workBlocks: {
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(0, 0, 0, 0) + 86400000),
              },
            },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
  });

  if (!user || !user.employee) return apiError("Employee not found", 404);

  return apiSuccess({
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    department: user.employee.department,
    designation: user.employee.designation,
    phone: user.employee.phone,
    address: user.employee.address,
    photoUrl: user.employee.photoUrl,
    recentAttendance: user.employee.attendance,
    recentLeaves: user.employee.leaveRequests,
    payroll: user.employee.payroll,
    todayWorkBlocks: user.employee.workBlocks,
  });
}
