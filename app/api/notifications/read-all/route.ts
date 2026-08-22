import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess } from "@/lib/guards";

// PATCH /api/notifications/read-all
export async function PATCH(req: NextRequest) {
  const session = await requireAuth(req);

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });

  return apiSuccess({ success: true });
}
