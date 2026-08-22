import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess } from "@/lib/guards";

// GET /api/hr/action-center
// Live computed dashboard for HR — parallelized queries, HTTP cache 60s
export async function GET(req: NextRequest) {
  await requireHR(req);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Run ALL DB queries in parallel — was sequential, now takes max(slowest) instead of sum(all)
  const [
    pendingLeaves,
    checkedInWithoutOut,
    allEmployees,
    todayCheckedInIds,
    totalAttendance,
    totalEmployeeCount,
  ] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        employee: { include: { user: { select: { name: true, employeeId: true } } } },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow }, checkIn: { not: null }, checkOut: null },
      include: { employee: { include: { user: { select: { name: true, employeeId: true } } } } },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: { id: true, name: true, employeeId: true },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow }, checkIn: { not: null } },
      select: { employeeId: true },
    }),
    prisma.attendance.count({
      where: { date: { gte: thirtyDaysAgo }, checkIn: { not: null } },
    }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
  ]);

  const checkedInIds = new Set(todayCheckedInIds.map((a) => a.employeeId));
  const notCheckedIn = allEmployees.filter((e) => !checkedInIds.has(e.id));

  let workingDays = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) workingDays++;
  }

  const attendanceRate =
    workingDays > 0 && totalEmployeeCount > 0
      ? Math.round((totalAttendance / (workingDays * totalEmployeeCount)) * 100)
      : 0;

  const response = apiSuccess({
    pendingLeaveCount: pendingLeaves.length,
    pendingLeaves: pendingLeaves.map((l) => ({
      id: l.id,
      employeeName: l.employee.user.name,
      employeeId: l.employee.user.employeeId,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      remarks: l.remarks,
      createdAt: l.createdAt,
    })),
    missingCheckout: checkedInWithoutOut.map((a) => ({
      attendanceId: a.id,
      employeeId: a.employee.user.employeeId,
      employeeName: a.employee.user.name,
      checkIn: a.checkIn,
    })),
    notCheckedIn: notCheckedIn.map((e) => ({
      id: e.id,
      name: e.name,
      employeeId: e.employeeId,
    })),
    stats: {
      totalEmployees: totalEmployeeCount,
      attendanceRate,
      pendingLeaves: pendingLeaves.length,
      missingCheckouts: checkedInWithoutOut.length,
    },
  });

  // Cache for 60s, serve stale for up to 5 minutes while revalidating in background
  response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=300");
  return response;
}
