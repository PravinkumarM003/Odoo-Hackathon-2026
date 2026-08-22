import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: { name: true, email: true, employeeId: true }
        },
        attendance: {
          where: {
            date: {
              gte: today,
              lt: tomorrow
            }
          },
          select: {
            checkIn: true,
            checkOut: true
          }
        }
      },
      orderBy: {
        user: { name: "asc" }
      }
    });

    const directory = employees.map(emp => {
      const todayAttendance = emp.attendance[0];
      const isOnline = todayAttendance?.checkIn && !todayAttendance?.checkOut;

      return {
        id: emp.userId,
        name: emp.user.name,
        email: emp.user.email,
        employeeId: emp.user.employeeId,
        department: emp.department,
        designation: emp.designation,
        isOnline: !!isOnline,
        checkInTime: todayAttendance?.checkIn || null,
      };
    });

    return NextResponse.json(directory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch directory" }, { status: 500 });
  }
}
