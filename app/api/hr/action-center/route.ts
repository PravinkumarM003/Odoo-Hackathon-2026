import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess } from "@/lib/guards";

// GET /api/hr/action-center
// Live computed dashboard for HR — cheap queries, high demo value
export async function GET(req: NextRequest) {
  await requireHR(req);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  // 1. Pending leave count
  const pendingLeaveCount = await prisma.leaveRequest.count({
    where: { status: "PENDING" },
  });

  // 2. Pending leave requests (for list)
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: {
      employee: {
        include: { user: { select: { name: true, employeeId: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  // 3. Employees who checked in but haven't checked out (working late / forgot)
  const checkedInWithoutOut = await prisma.attendance.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
      checkIn: { not: null },
      checkOut: null,
    },
    include: {
      employee: {
        include: { user: { select: { name: true, employeeId: true } } },
      },
    },
  });

  // 4. Employees who haven't checked in today (absent so far)
  const allEmployees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true, employeeId: true },
  });

  const checkedInIds = new Set(
    (
      await prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow }, checkIn: { not: null } },
        select: { employeeId: true },
      })
    ).map((a) => a.employeeId)
  );

  const notCheckedIn = allEmployees.filter((e) => !checkedInIds.has(e.id));

  // 5. Summary stats (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalAttendance = await prisma.attendance.count({
    where: { date: { gte: thirtyDaysAgo }, checkIn: { not: null } },
  });

  const totalEmployeeCount = await prisma.user.count({ where: { role: "EMPLOYEE" } });

  // Working days in last 30 days (approx — exclude weekends)
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

  return apiSuccess({
    pendingLeaveCount,
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
      pendingLeaves: pendingLeaveCount,
      missingCheckouts: checkedInWithoutOut.length,
    },
  });
}
