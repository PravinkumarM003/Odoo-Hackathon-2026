"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, MessageSquare, Filter } from "lucide-react";
import { hrApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  remarks: string;
  status: string;
  reviewerComment?: string;
  createdAt: string;
  employee: {
    user: { name: string; employeeId: string };
  };
}

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [actionId, setActionId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function fetchLeaves() {
    const data = await hrApi.getLeaves(filter) as LeaveRecord[];
    setLeaves(data);
  }

  useEffect(() => { fetchLeaves(); }, [filter]);

  async function handleAction() {
    if (!actionId || !actionType) return;
    if (actionType === "reject" && !comment.trim()) {
      setError("A comment is required when rejecting a leave request.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (actionType === "approve") {
        await hrApi.approveLeave(actionId, comment);
      } else {
        await hrApi.rejectLeave(actionId, comment);
      }
      setSuccess(`Leave ${actionType === "approve" ? "approved" : "rejected"} successfully`);
      setActionId(null);
      setComment("");
      setActionType(null);
      fetchLeaves();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  function openAction(id: string, type: "approve" | "reject") {
    setActionId(id);
    setActionType(type);
    setComment("");
    setError("");
  }

  const filterOptions = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">Leave Requests</h1>
        <p className="text-neutral-400 mt-1">Review and action employee leave requests</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ {success}
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 p-1 glass rounded-xl border border-white/8 w-fit">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-white/10 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Leave list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {leaves.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center border border-white/8"
            >
              <Clock className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
              <p className="text-neutral-500">No {filter.toLowerCase()} leave requests</p>
            </motion.div>
          ) : (
            leaves.map((leave, i) => (
              <motion.div
                key={leave.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 border border-white/8 card-shine card-interactive"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {leave.employee.user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-white font-semibold">{leave.employee.user.name}</span>
                        <span className="text-neutral-500 text-xs ml-2">{leave.employee.user.employeeId}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        leave.status === "PENDING" ? "badge-pending" :
                        leave.status === "APPROVED" ? "badge-approved" : "badge-rejected"
                      }`}>
                        {leave.status.charAt(0) + leave.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-neutral-500 text-xs">Type</span>
                        <p className="text-neutral-200 font-medium">{leave.type}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">From</span>
                        <p className="text-neutral-200">{formatDate(leave.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">To</span>
                        <p className="text-neutral-200">{formatDate(leave.endDate)}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">Applied</span>
                        <p className="text-neutral-200">{formatDate(leave.createdAt)}</p>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-sm mt-2 italic">&ldquo;{leave.remarks}&rdquo;</p>

                    {leave.reviewerComment && (
                      <div className="mt-2 text-xs text-neutral-400 border-l-2 border-neutral-700 pl-3">
                        <span className="text-neutral-500">HR comment: </span>{leave.reviewerComment}
                      </div>
                    )}
                  </div>

                  {leave.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAction(leave.id, "approve")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/25 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAction(leave.id, "reject")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/25 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Action modal */}
      <AnimatePresence>
        {actionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setActionId(null); setActionType(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md glass rounded-2xl p-6 border border-white/15"
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                {actionType === "approve" ? "✅ Approve Leave" : "❌ Reject Leave"}
              </h3>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Comment {actionType === "reject" && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={actionType === "reject" ? "Required: provide a reason for rejection" : "Optional: add a note for the employee"}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setActionId(null); setActionType(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-sm transition-all">
                  Cancel
                </button>
                <motion.button
                  onClick={handleAction}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 ${
                    actionType === "approve"
                      ? "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  {loading ? "Processing..." : actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
