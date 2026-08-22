import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { apiError } from "@/lib/guards";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, department, designation } = await req.json();

    if (!name || !email || !password || !department || !designation) {
      return apiError("All fields are required", 400);
    }

    if (password.length < 8) {
      return apiError("Password must be at least 8 characters", 400);
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    // Count existing users to generate employee ID
    const count = await prisma.user.count();
    const employeeId = `EMP${String(count + 1).padStart(3, "0")}`;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        employeeId,
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        role: "EMPLOYEE", // ALWAYS Employee — no role escalation possible
        employee: {
          create: {
            department: department.trim(),
            designation: designation.trim(),
          },
        },
      },
      include: { employee: true },
    });

    const sessionPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      role: "EMPLOYEE" as const,
    };

    const response = NextResponse.json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.employee!.department,
        designation: user.employee!.designation,
      },
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error) {
    console.error("Sign-up error:", error);
    return apiError("Internal server error", 500);
  }
}
