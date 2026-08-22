import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// PATCH /api/hr/leaves/[id]/reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireHR(req);
  const { comment } = await req.json().catch(() => ({ comment: undefined }));

  if (!comment || comment.trim().length === 0) {
    return apiError("A comment is required when rejecting a leave request", 400);
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: params.id },
    include: {
      employee: { include: { user: true } },
    },
  });

  if (!leave) return apiError("Leave request not found", 404);
  if (leave.status !== "PENDING") return apiError("Leave request is no longer pending", 400);

  // Transactional: update leave + create notification
  const [updatedLeave] = await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewerComment: comment.trim(),
        reviewedBy: session.userId,
      },
    }),
    prisma.notification.create({
      data: {
        userId: leave.employeeId,
        type: "LEAVE_REJECTED",
        message: `Your ${leave.type} leave request (${leave.startDate.toLocaleDateString()} – ${leave.endDate.toLocaleDateString()}) was not approved. Reason: ${comment.trim()}`,
      },
    }),
  ]);

  return apiSuccess(updatedLeave);
}
