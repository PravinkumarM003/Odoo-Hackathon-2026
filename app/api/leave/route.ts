import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/guards";

// GET /api/leave
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(leaves);
}

// POST /api/leave
export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  const { type, startDate, endDate, remarks } = await req.json();

  if (!type || !startDate || !endDate || !remarks) {
    return apiError("All fields are required", 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return apiError("Invalid dates", 400);
  }

  if (end < start) {
    return apiError("End date must be after start date", 400);
  }

  if (start < new Date()) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return apiError("Cannot apply for leave in the past", 400);
    }
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: session.userId,
      type,
      startDate: start,
      endDate: end,
      remarks,
      status: "PENDING",
    },
  });

  // Notify HR
  const hrUsers = await prisma.user.findMany({ where: { role: "HR" } });
  const employee = await prisma.user.findUnique({ where: { id: session.userId } });

  for (const hr of hrUsers) {
    await prisma.notification.create({
      data: {
        userId: hr.id,
        type: "LEAVE_REQUEST",
        message: `${employee?.name ?? "An employee"} has applied for ${type} leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Action required.`,
      },
    });
  }

  return apiSuccess(leave, 201);
}
