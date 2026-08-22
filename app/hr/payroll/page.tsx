"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Edit2, Save, X } from "lucide-react";
import { hrApi } from "@/lib/api-client";
import { formatCurrency, getInitials } from "@/lib/utils";

interface PayrollRecord {
  id: string;
  employeeId: string;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  employee: {
    user: { name: string; employeeId: string };
  };
}

export default function HRPayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ basic: 0, allowances: 0, deductions: 0 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function fetchPayroll() {
    const data = await hrApi.getPayroll() as PayrollRecord[];
    setRecords(data);
  }

  useEffect(() => { fetchPayroll(); }, []);

  function startEdit(r: PayrollRecord) {
    setEditing(r.employeeId);
    setEditForm({ basic: r.basic, allowances: r.allowances, deductions: r.deductions });
  }

  async function saveEdit(employeeId: string) {
    setLoading(true);
    try {
      await hrApi.updatePayroll(employeeId, editForm);
      setSuccess("Payroll updated!");
      setEditing(null);
      fetchPayroll();
      setTimeout(() => setSuccess(""), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 font-display">Payroll Management</h1>
        <p className="text-neutral-400 mt-1">View and update employee compensation</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ {success}
        </motion.div>
      )}

      <div className="space-y-3">
        {records.map((r, i) => (
          <motion.div key={r.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ }}
            className="glass rounded-2xl p-5 border border-neutral-50/8 card-shine"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-neutral-50 text-sm font-bold">
                  {getInitials(r.employee.user.name)}
                </div>
                <div>
                  <p className="text-neutral-50 font-semibold">{r.employee.user.name}</p>
                  <p className="text-neutral-500 text-xs">{r.employee.user.employeeId}</p>
                </div>
              </div>

              {editing === r.employeeId ? (
                <div className="flex items-center gap-3 flex-wrap">
                  {(["basic", "allowances", "deductions"] as const).map(key => (
                    <div key={key}>
                      <label className="block text-xs text-neutral-500 mb-1 capitalize">{key}</label>
                      <input
                        type="number"
                        value={editForm[key]}
                        onChange={e => setEditForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-28 bg-neutral-50/5 border border-neutral-50/10 rounded-lg px-3 py-1.5 text-neutral-50 text-sm"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 self-end pb-1">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => saveEdit(r.employeeId)} disabled={loading}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/30 transition-all">
                      <Save className="w-3 h-3" />{loading ? "Saving..." : "Save"}
                    </motion.button>
                    <button onClick={() => setEditing(null)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-50/5 border border-neutral-50/10 text-neutral-400 text-xs hover:text-neutral-50">
                      <X className="w-3 h-3" />Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  {[
                    { label: "Basic", value: r.basic },
                    { label: "Allowances", value: r.allowances, color: "text-green-400" },
                    { label: "Deductions", value: r.deductions, color: "text-red-400" },
                    { label: "Net", value: r.netSalary, color: "text-blue-400", bold: true },
                  ].map(({ label, value, color, bold }) => (
                    <div key={label} className="text-right">
                      <p className="text-xs text-neutral-500">{label}</p>
                      <p className={`text-sm font-${bold ? "bold" : "medium"} ${color ?? "text-neutral-200"}`}>
                        {formatCurrency(value)}
                      </p>
                    </div>
                  ))}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => startEdit(r)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-50/5 border border-neutral-50/10 text-neutral-400 hover:text-neutral-50 hover:border-neutral-50/20 text-xs transition-all">
                    <Edit2 className="w-3 h-3" />Edit
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
