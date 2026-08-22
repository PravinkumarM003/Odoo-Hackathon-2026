import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess } from "@/lib/guards";

// GET /api/hr/employees
export async function GET(req: NextRequest) {
  await requireHR(req);

  const employees = await prisma.user.findMany({
    include: {
      employee: true,
      _count: { select: { notifications: true } },
    },
    orderBy: { name: "asc" },
  });

  const result = employees.map((u) => ({
    id: u.id,
    employeeId: u.employeeId,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    department: u.employee?.department,
    designation: u.employee?.designation,
    phone: u.employee?.phone,
    photoUrl: u.employee?.photoUrl,
  }));

  const response = apiSuccess(result);
  response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
  return response;
}
