"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { payrollApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

interface Payroll {
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  updatedAt: string;
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payrollApi.getMy().then((d) => setPayroll(d as Payroll)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-24 bg-neutral-50/3 rounded-2xl animate-pulse" />)}
  </div>;

  if (!payroll) return (
    <div className="text-center py-20 text-neutral-500">
      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p>No payroll data available</p>
    </div>
  );

  const items = [
    { label: "Basic Salary", amount: payroll.basic, type: "neutral", icon: DollarSign },
    { label: "Allowances", amount: payroll.allowances, type: "positive", icon: ArrowUpRight },
    { label: "Deductions", amount: payroll.deductions, type: "negative", icon: ArrowDownRight },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk']">Payroll</h1>
        <p className="text-neutral-400 mt-1">Your compensation breakdown</p>
      </div>

      {/* Net salary hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-center card-shine card-interactive"
      >
        <p className="text-neutral-400 text-sm uppercase tracking-wider mb-2">Annual Net Salary</p>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl font-bold gradient-text font-['Space_Grotesk'] mb-2 animate-float"
        >
          {formatCurrency(payroll.netSalary)}
        </motion.div>
        <p className="text-neutral-500 text-xs">
          Updated: {new Date(payroll.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* Breakdown */}
      <div className="space-y-3 stagger-children">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 4, scale: 1.01 }}
              className="glass rounded-xl p-5 border border-neutral-50/8 flex items-center justify-between card-interactive"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.type === "positive" ? "bg-green-500/15" :
                  item.type === "negative" ? "bg-red-500/15" : "bg-blue-500/15"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    item.type === "positive" ? "text-green-400" :
                    item.type === "negative" ? "text-red-400" : "text-blue-400"
                  }`} />
                </div>
                <span className="text-neutral-50 font-medium">{item.label}</span>
              </div>
              <span className={`text-lg font-bold ${
                item.type === "positive" ? "text-green-400" :
                item.type === "negative" ? "text-red-400" : "text-neutral-200"
              }`}>
                {item.type === "negative" ? "−" : "+"}{formatCurrency(item.amount)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-5 border border-neutral-50/8"
      >
        <h3 className="text-neutral-400 text-sm font-medium mb-3">Monthly Breakdown</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Gross", value: payroll.basic + payroll.allowances },
            { label: "Deductions", value: payroll.deductions },
            { label: "Net", value: payroll.netSalary },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-neutral-500 text-xs mb-1">{label} / month</p>
              <p className="text-neutral-50 font-semibold">{formatCurrency(Math.round(value / 12))}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
