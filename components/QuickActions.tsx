import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, Zap, Clock } from "lucide-react";
import { leaveApi, attendanceApi } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useSession();

  async function quickCheckOut() {
    setLoading(true);
    try {
      await attendanceApi.checkOut();
      setOpen(false);
      router.refresh();
      router.push("/dashboard");
    } catch {
      // silently fail — user can try again
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="btn-glow flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-neutral-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 animate-gradient"
      >
        <Plus className="w-4 h-4" />
        Quick Action
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-neutral-900 rounded-2xl border border-neutral-50/10 shadow-2xl overflow-hidden z-50 relative"
              >
                <div className="p-4 border-b border-neutral-50/5 flex justify-between items-center">
                  <h3 className="font-semibold text-neutral-50">Quick Actions</h3>
                  <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-50">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {user?.role === "EMPLOYEE" && (
                    <button onClick={() => { setOpen(false); router.push("/leave"); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50/5 hover:bg-neutral-50/10 border border-neutral-50/5 transition-colors text-left text-neutral-200">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">Apply Leave</div>
                        <div className="text-xs text-neutral-500">Request time off</div>
                      </div>
                    </button>
                  )}
                  <button onClick={() => { setOpen(false); router.push("/log-activity"); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50/5 hover:bg-neutral-50/10 border border-neutral-50/5 transition-colors text-left text-neutral-200">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Log Activity</div>
                      <div className="text-xs text-neutral-500">Add a work block to timeline</div>
                    </div>
                  </button>
                  <button onClick={quickCheckOut} disabled={loading} className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50/5 hover:bg-neutral-50/10 border border-neutral-50/5 transition-colors text-left text-neutral-200">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Quick Check-Out</div>
                      <div className="text-xs text-neutral-500">End your day instantly</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
