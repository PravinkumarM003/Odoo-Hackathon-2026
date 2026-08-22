"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { leaveApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";

const LEAVE_TYPES = ["Annual", "Sick", "Personal", "Maternity", "Emergency"];

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  remarks: string;
  status: string;
  reviewerComment?: string;
  createdAt: string;
}

interface Balance {
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

const statusConfig = {
  PENDING: { icon: AlertCircle, cls: "badge-pending", label: "Pending" },
  APPROVED: { icon: CheckCircle, cls: "badge-approved", label: "Approved" },
  REJECTED: { icon: XCircle, cls: "badge-rejected", label: "Rejected" },
};

export default function LeavePage() {
  const { user } = useSession();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Annual", startDate: "", endDate: "", remarks: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchLeaves() {
    try {
      const [l, b] = await Promise.all([
        leaveApi.getMy() as Promise<LeaveRequest[]>,
        leaveApi.getBalance() as Promise<Balance>,
      ]);
      setLeaves(l);
      setBalance(b);
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchLeaves(); }, []);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await leaveApi.apply(form);
      setSuccess("Leave request submitted!");
      setShowForm(false);
      setForm({ type: "Annual", startDate: "", endDate: "", remarks: "" });
      fetchLeaves();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">Leave Management</h1>
          <p className="text-neutral-400 mt-1">Apply for and track your leave requests</p>
        </div>
        {user?.role === "EMPLOYEE" && (
          <motion.button
            id="apply-leave-btn"
            onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glow flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 animate-gradient"
        >
            Apply Leave
          </motion.button>
        )}
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ {success}
        </motion.div>
      )}

      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-3 gap-4 stagger-children">
          {[
            { label: "Annual", data: balance.annual, color: "text-green-400 bg-green-500/15" },
            { label: "Sick", data: balance.sick, color: "text-blue-400 bg-blue-500/15" },
            { label: "Personal", data: balance.personal, color: "text-purple-400 bg-purple-500/15" },
          ].map(({ label, data, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl p-4 border border-white/8 card-shine card-interactive"
            >
              <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">{label} Leave</div>
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-3xl font-bold ${color.split(" ")[0]} animate-float`} style={{ animationDelay: `${Math.random()}s` }}>{data.remaining}</span>
                <span className="text-neutral-500 text-sm mb-1">/ {data.total} days</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.remaining / data.total) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${color.split(" ")[1]}`}
                />
              </div>
              <p className="text-xs text-neutral-600 mt-1">{data.used} used</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leave history */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Leave History
        </h2>
        {leaves.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leave requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {leaves.map((leave, i) => {
                const cfg = statusConfig[leave.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start justify-between p-4 rounded-xl bg-white/3 border border-white/6 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 shrink-0 text-neutral-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{leave.type} Leave</span>
                          <motion.span
                            layout
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}
                          >
                            {cfg.label}
                          </motion.span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 italic">{leave.remarks}</p>
                        {leave.reviewerComment && (
                          <p className="text-xs text-neutral-400 mt-1 border-l-2 border-neutral-700 pl-2">
                            HR: {leave.reviewerComment}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-600">{formatDate(leave.createdAt)}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Apply Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md glass rounded-2xl p-6 border border-white/15 card-shine"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">Apply for Leave</h3>
                <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Leave Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                  >
                    {LEAVE_TYPES.map(t => <option key={t} value={t} className="bg-neutral-900">{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                      required
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Remarks</label>
                  <textarea
                    value={form.remarks}
                    onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
                    placeholder="Briefly describe the reason..."
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
