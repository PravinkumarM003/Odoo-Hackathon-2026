import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError } from "@/lib/guards";

// PATCH /api/notifications/[id]/read
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth(req);

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notification) return apiError("Notification not found", 404);
  if (notification.userId !== session.userId) return apiError("Forbidden", 403);

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });

  return apiSuccess(updated);
}
