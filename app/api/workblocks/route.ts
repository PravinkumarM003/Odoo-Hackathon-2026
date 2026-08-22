import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// GET /api/workblocks?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  const dateParam = req.nextUrl.searchParams.get("date");

  let date: Date;
  if (dateParam) {
    date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);
  } else {
    date = new Date();
    date.setHours(0, 0, 0, 0);
  }

  const blocks = await prisma.workBlock.findMany({
    where: {
      employeeId: session.userId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 86400000),
      },
    },
    orderBy: { startTime: "asc" },
  });

  return apiSuccess(blocks);
}

// POST /api/workblocks
export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  const { date, startTime, endTime, category, description, employeeId } = await req.json();

  if (!startTime || !endTime || !category || !description) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  // If HR provides an employeeId, assign it to that employee. Otherwise, assign it to the logged in user.
  const targetEmployeeId = (session.role === "HR" && employeeId) ? employeeId : session.userId;

  const blockDate = date ? new Date(date) : new Date();
  blockDate.setHours(0, 0, 0, 0);

  const newBlock = await prisma.workBlock.create({
    data: {
      employeeId: targetEmployeeId,
      date: blockDate,
      startTime,
      endTime,
      category,
      description,
    },
  });

  return apiSuccess(newBlock);
}
