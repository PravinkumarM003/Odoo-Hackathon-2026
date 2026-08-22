import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// GET /api/notifications
export async function GET(req: NextRequest) {
  const session = await requireAuth(req);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return apiSuccess(notifications);
}
