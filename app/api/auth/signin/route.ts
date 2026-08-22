import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { apiError } from "@/lib/guards";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return apiError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return apiError("Invalid credentials", 401);
    }

    const sessionPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      role: user.role as "HR" | "EMPLOYEE",
    };

    const response = NextResponse.json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.employee.department,
        designation: user.employee.designation,
      },
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error) {
    console.error("Sign-in error:", error);
    return apiError("Internal server error", 500);
  }
}
