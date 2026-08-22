import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/guards";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employee: true },
  });

  if (!user || !user.employee) return apiError("User not found", 404);

  return apiSuccess({
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.employee.department,
    designation: user.employee.designation,
    phone: user.employee.phone,
    address: user.employee.address,
    photoUrl: user.employee.photoUrl,
  });
}
