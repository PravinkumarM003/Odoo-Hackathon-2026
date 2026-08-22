"use client";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Plus, X } from "lucide-react";
import { workBlocksApi, hrApi } from "@/lib/api-client";
import { useSession } from "@/context/SessionContext";

export default function LogActivityPage() {
  const { user, loading: sessionLoading } = useSession();
  const [newBlock, setNewBlock] = useState({ startTime: "", endTime: "", category: "DEEP_WORK", description: "", employeeId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hrEmployees, setHrEmployees] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (sessionLoading) return;
    
    if (user?.role === "HR") {
      try {
        const emps = await hrApi.getEmployees();
        setHrEmployees(emps as {id: string, name: string}[]);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, [user, sessionLoading]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workBlocksApi.addWorkBlock({
        ...newBlock,
        employeeId: newBlock.employeeId || undefined
      });
      alert("Activity logged successfully!");
      setNewBlock({ startTime: "", endTime: "", category: "DEEP_WORK", description: "", employeeId: "" });
    } catch (err) {
      alert("Failed to log activity.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-neutral-50/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-neutral-50/3 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-neutral-50" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk']">Log Activity</h1>
        </div>
        <p className="text-neutral-400 ml-11">
          Record a new block of work
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass rounded-2xl p-6 border border-blue-500/30 shadow-xl shadow-blue-900/10"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          {user?.role === "HR" && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Assign to Employee (Optional)</label>
              <select value={newBlock.employeeId} onChange={e => setNewBlock({...newBlock, employeeId: e.target.value})} className="w-full bg-neutral-900 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                <option value="">Assign to myself</option>
                {hrEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-400 mb-1">Start Time</label>
              <input type="time" required value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-400 mb-1">End Time</label>
              <input type="time" required value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
              <select required value={newBlock.category} onChange={e => setNewBlock({...newBlock, category: e.target.value})} className="w-full bg-neutral-900 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                <option value="DEEP_WORK">Deep Work</option>
                <option value="MEETING">Meeting</option>
                <option value="ADMIN">Admin</option>
                <option value="REST">Rest</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-neutral-400 mb-1">Description</label>
              <input type="text" required placeholder="What did you work on?" value={newBlock.description} onChange={e => setNewBlock({...newBlock, description: e.target.value})} className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50">
              {submitting ? "Saving..." : "Save Activity"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
