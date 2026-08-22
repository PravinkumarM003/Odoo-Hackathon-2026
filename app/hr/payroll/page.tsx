"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Edit2, Save, X, Plus, AlertCircle } from "lucide-react";
import { hrApi } from "@/lib/api-client";
import { formatCurrency, getInitials } from "@/lib/utils";

interface PayrollRecord {
  id: string | null;
  employeeId: string;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  hasPayroll: boolean;
  employee: {
    user: { name: string; employeeId: string };
  };
}

const emptyForm = { basic: 0, allowances: 0, deductions: 0 };

export default function HRPayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [assignForm, setAssignForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  async function fetchPayroll() {
    try {
      const data = await hrApi.getPayroll() as PayrollRecord[];
      setRecords(data);
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => { fetchPayroll(); }, []);

  function startEdit(r: PayrollRecord) {
    setEditing(r.employeeId);
    setAssigning(null);
    setEditForm({ basic: r.basic, allowances: r.allowances, deductions: r.deductions });
  }

  function startAssign(empId: string) {
    setAssigning(empId);
    setEditing(null);
    setAssignForm(emptyForm);
  }

  async function saveEdit(employeeId: string) {
    setLoading(true);
    try {
      await hrApi.updatePayroll(employeeId, editForm);
      setSuccess("Salary updated successfully!");
      setEditing(null);
      await fetchPayroll();
      setTimeout(() => setSuccess(""), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function saveAssign(employeeId: string) {
    setLoading(true);
    try {
      await hrApi.createPayroll({ employeeId, ...assignForm });
      setSuccess("Salary assigned successfully!");
      setAssigning(null);
      await fetchPayroll();
      setTimeout(() => setSuccess(""), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  const assigned = records.filter(r => r.hasPayroll);
  const unassigned = records.filter(r => !r.hasPayroll);

  const SalaryFields = ({
    form,
    onChange,
  }: {
    form: typeof emptyForm;
    onChange: (key: keyof typeof emptyForm, val: number) => void;
  }) => (
    <div className="flex items-end gap-3 flex-wrap mt-4">
      {(["basic", "allowances", "deductions"] as const).map(key => (
        <div key={key}>
          <label className="block text-xs text-neutral-500 mb-1 capitalize">{key}</label>
          <input
            type="number"
            min={0}
            value={form[key]}
            onChange={e => onChange(key, Number(e.target.value))}
            className="w-28 bg-neutral-50/5 border border-neutral-50/10 rounded-lg px-3 py-1.5 text-neutral-50 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Net Salary</label>
        <div className="w-28 bg-blue-500/8 border border-blue-500/20 rounded-lg px-3 py-1.5 text-blue-400 text-sm font-semibold">
          {formatCurrency(form.basic + form.allowances - form.deductions)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 font-display">Payroll Management</h1>
        <p className="text-neutral-400 mt-1">Assign and update employee compensation</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-50/3 rounded-2xl animate-pulse border border-neutral-50/5" />
          ))}
        </div>
      ) : (
        <>
          {/* ─── Unassigned employees ─── */}
          {unassigned.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-amber-400">No Salary Assigned ({unassigned.length})</h2>
              </div>
              {unassigned.map(r => (
                <motion.div key={r.employeeId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-500/3">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-neutral-50 text-sm font-bold">
                        {getInitials(r.employee.user.name)}
                      </div>
                      <div>
                        <p className="text-neutral-50 font-semibold">{r.employee.user.name}</p>
                        <p className="text-neutral-500 text-xs">{r.employee.user.employeeId}</p>
                      </div>
                    </div>

                    {assigning === r.employeeId ? (
                      <div className="w-full">
                        <SalaryFields
                          form={assignForm}
                          onChange={(key, val) => setAssignForm(p => ({ ...p, [key]: val }))}
                        />
                        <div className="flex gap-2 mt-3">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => saveAssign(r.employeeId)} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/30 transition-all">
                            <Save className="w-3.5 h-3.5" />{loading ? "Saving..." : "Assign Salary"}
                          </motion.button>
                          <button onClick={() => setAssigning(null)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-50/5 border border-neutral-50/10 text-neutral-400 hover:text-neutral-50 text-sm">
                            <X className="w-3.5 h-3.5" />Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => startAssign(r.employeeId)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs transition-all">
                        <Plus className="w-3.5 h-3.5" />Assign Salary
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ─── Assigned employees ─── */}
          <div className="space-y-3">
            {assigned.length > 0 && (
              <h2 className="text-sm font-semibold text-neutral-400">Assigned ({assigned.length})</h2>
            )}
            {assigned.map(r => (
              <motion.div key={r.id ?? r.employeeId}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-neutral-50/8 card-shine">
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
                    <div className="w-full">
                      <SalaryFields
                        form={editForm}
                        onChange={(key, val) => setEditForm(p => ({ ...p, [key]: val }))}
                      />
                      <div className="flex gap-2 mt-3">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => saveEdit(r.employeeId)} disabled={loading}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/30 transition-all">
                          <Save className="w-3.5 h-3.5" />{loading ? "Saving..." : "Save Changes"}
                        </motion.button>
                        <button onClick={() => setEditing(null)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-50/5 border border-neutral-50/10 text-neutral-400 hover:text-neutral-50 text-sm">
                          <X className="w-3.5 h-3.5" />Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6 flex-wrap">
                      {[
                        { label: "Basic", value: r.basic },
                        { label: "Allowances", value: r.allowances, color: "text-green-400" },
                        { label: "Deductions", value: r.deductions, color: "text-red-400" },
                        { label: "Net", value: r.netSalary, color: "text-blue-400", bold: true },
                      ].map(({ label, value, color, bold }) => (
                        <div key={label} className="text-right">
                          <p className="text-xs text-neutral-500">{label}</p>
                          <p className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color ?? "text-neutral-200"}`}>
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
        </>
      )}
    </div>
  );
}
