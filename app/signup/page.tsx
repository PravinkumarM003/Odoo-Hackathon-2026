"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Briefcase, Building, ArrowRight, Zap } from "lucide-react";
import { authApi } from "@/lib/api-client";

const DEPARTMENTS = ["Engineering", "Design", "Product", "Sales", "Finance", "HR", "Marketing", "Operations", "Legal"];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "", designation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.signUp(form.name, form.email, form.password, form.department, form.designation);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-neutral-50" fill="white" />
            </div>
            <span className="text-2xl font-bold gradient-text font-['Space_Grotesk']">Dayflow</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Join your team</h1>
          <p className="text-neutral-400 text-sm">Create your employee account</p>
        </div>

        <div className="glass rounded-2xl p-8 card-shine">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Security note */}
          <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
            🔒 All accounts are created as Employee role. HR accounts are provisioned by administrators only.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={<User />} label="Full Name" id="name" type="text" placeholder="Alex Chen"
              value={form.name} onChange={update("name")} required />
            <Field icon={<Mail />} label="Work Email" id="email" type="email" placeholder="you@company.com"
              value={form.email} onChange={update("email")} required />
            <Field icon={<Lock />} label="Password" id="password" type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={update("password")} required />

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <select
                  id="department"
                  value={form.department}
                  onChange={update("department")}
                  required
                  className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl pl-10 pr-4 py-3 text-neutral-50 focus:border-blue-500/50 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-neutral-900">Select department</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d} className="bg-neutral-900">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <Field icon={<Briefcase />} label="Designation" id="designation" type="text" placeholder="e.g. Software Engineer"
              value={form.designation} onChange={update("designation")} required />

            <motion.button
              id="signup-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-neutral-50 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-50/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, label, id, ...props }: { icon: React.ReactNode; label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        <input
          id={id}
          {...props}
          className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl pl-10 pr-4 py-3 text-neutral-50 placeholder-neutral-500 focus:border-blue-500/50 focus:bg-neutral-50/8 transition-all text-sm"
        />
      </div>
    </div>
  );
}
