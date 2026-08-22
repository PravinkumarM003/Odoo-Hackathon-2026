import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireHR, apiSuccess, apiError } from "@/lib/guards";

// PATCH /api/hr/leaves/[id]/approve
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireHR(req);
  const { comment } = await req.json().catch(() => ({ comment: undefined }));

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
        status: "APPROVED",
        reviewerComment: comment ?? "Approved",
        reviewedBy: session.userId,
      },
    }),
    prisma.notification.create({
      data: {
        userId: leave.employeeId,
        type: "LEAVE_APPROVED",
        message: `Your ${leave.type} leave request (${leave.startDate.toLocaleDateString()} – ${leave.endDate.toLocaleDateString()}) has been approved. ${comment ? comment : ""}`,
      },
    }),
  ]);

  return apiSuccess(updatedLeave);
}
