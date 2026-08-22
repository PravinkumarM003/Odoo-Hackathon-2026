import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/guards";

// GET /api/profile
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employee: true },
  });

  if (!user || !user.employee) return apiError("Not found", 404);

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
    createdAt: user.createdAt,
  });
}

// PATCH /api/profile
export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);
  const { name, phone, address, photoUrl } = await req.json();

  const updateData: Record<string, unknown> = {};
  const employeeUpdateData: Record<string, unknown> = {};

  if (name) updateData.name = name.trim();
  if (phone !== undefined) employeeUpdateData.phone = phone;
  if (address !== undefined) employeeUpdateData.address = address;
  if (photoUrl !== undefined) employeeUpdateData.photoUrl = photoUrl;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    }),
    prisma.employee.update({
      where: { userId: session.userId },
      data: employeeUpdateData,
    }),
  ]);

  return apiSuccess({ success: true });
}
