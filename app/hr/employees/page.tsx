"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Briefcase, Building, Mail, ChevronRight } from "lucide-react";
import { hrApi } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  phone?: string;
}

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [empDetail, setEmpDetail] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    hrApi.getEmployees()
      .then(d => setEmployees(d as Employee[]))
      .finally(() => setLoading(false));
  }, []);

  async function openEmployee(emp: Employee) {
    setSelected(emp);
    setDetailLoading(true);
    try {
      const detail = await hrApi.getEmployee(emp.id) as Record<string, unknown>;
      setEmpDetail(detail);
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  }

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const DEPT_COLORS: Record<string, string> = {
    Engineering: "bg-blue-500/20 text-blue-400",
    Design: "bg-purple-500/20 text-purple-400",
    Product: "bg-teal-500/20 text-teal-400",
    Sales: "bg-green-500/20 text-green-400",
    Finance: "bg-yellow-500/20 text-yellow-400",
    HR: "bg-pink-500/20 text-pink-400",
    Marketing: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 font-display">Employees</h1>
          <p className="text-neutral-400 mt-1">{employees.length} team members</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by name, department, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full glass border border-neutral-50/10 rounded-xl pl-11 pr-4 py-3 text-neutral-50 placeholder-neutral-500 focus:border-blue-500/50 transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-neutral-50/3 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(emp => (
              <motion.div
                key={emp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openEmployee(emp)}
                className="glass glass-hover rounded-2xl p-5 border border-neutral-50/8 card-shine cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-neutral-50 font-bold text-sm shrink-0 shadow-lg">
                    {getInitials(emp.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-neutral-50 font-semibold truncate">{emp.name}</p>
                        <p className="text-neutral-500 text-xs">{emp.employeeId}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-neutral-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    <p className="text-neutral-400 text-xs mt-1 truncate">{emp.designation}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[emp.department] ?? "bg-neutral-800 text-neutral-400"}`}>
                        {emp.department}
                      </span>
                      {emp.role === "HR" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">HR</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Employee detail drawer */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setEmpDetail(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md glass border-l border-neutral-50/10 overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-50/8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-neutral-50 font-bold text-xl shadow-xl">
                    {getInitials(selected.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-50">{selected.name}</h2>
                    <p className="text-neutral-400 text-sm">{selected.designation}</p>
                    <p className="text-neutral-600 text-xs mt-0.5">{selected.employeeId}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {detailLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-50/3 rounded-xl animate-pulse" />)}
                  </div>
                ) : empDetail ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Building, label: "Department", value: selected.department },
                        { icon: Briefcase, label: "Designation", value: selected.designation },
                        { icon: Mail, label: "Email", value: selected.email },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="glass rounded-xl p-3 border border-neutral-50/6 col-span-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5 text-neutral-500" />
                            <span className="text-xs text-neutral-500">{label}</span>
                          </div>
                          <p className="text-sm text-neutral-50 truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Today's work blocks */}
                    {Array.isArray((empDetail as { todayWorkBlocks?: unknown[] }).todayWorkBlocks) && (empDetail as { todayWorkBlocks: unknown[] }).todayWorkBlocks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          Today's Work
                        </h3>
                        <div className="space-y-2">
                          {((empDetail as { todayWorkBlocks: Array<{ id: string; category: string; startTime: string; endTime: string; description: string }> }).todayWorkBlocks).map((b) => {
                            const cfg = {
                              DEEP_WORK: "text-violet-300 bg-violet-500/15 border-violet-500/30",
                              MEETING: "text-teal-300 bg-teal-500/15 border-teal-500/30",
                              ADMIN: "text-amber-300 bg-amber-500/15 border-amber-500/30",
                              REST: "text-slate-400 bg-slate-500/10 border-slate-500/20",
                            }[b.category] ?? "text-neutral-400 bg-neutral-800 border-neutral-700";
                            return (
                              <div key={b.id} className={`rounded-lg p-3 border text-xs ${cfg}`}>
                                <div className="flex justify-between mb-1">
                                  <span className="font-semibold">{b.category.replace("_", " ")}</span>
                                  <span className="opacity-70">{b.startTime}–{b.endTime}</span>
                                </div>
                                <p className="opacity-80 leading-relaxed">{b.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              <button
                onClick={() => { setSelected(null); setEmpDetail(null); }}
                className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-50 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-50/10"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
