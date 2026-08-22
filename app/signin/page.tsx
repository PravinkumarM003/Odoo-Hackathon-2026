"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.signIn(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg glow-blue">
              <Zap className="w-5 h-5 text-neutral-50" fill="white" />
            </div>
            <span className="text-2xl font-bold font-display gradient-text">Dayflow</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-50 mb-2">Welcome back</h1>
          <p className="text-neutral-400 text-sm">Every workday, perfectly aligned.</p>
        </motion.div>

        {/* Card */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dayflow.demo"
                  required
                  className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl pl-10 pr-4 py-3 text-neutral-50 placeholder-neutral-500 focus:border-blue-500/50 focus:bg-neutral-50/8 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl pl-10 pr-10 py-3 text-neutral-50 placeholder-neutral-500 focus:border-blue-500/50 focus:bg-neutral-50/8 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              id="signin-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-neutral-50 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-50/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-neutral-50/3 border border-neutral-50/6">
            <p className="text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wider">Demo accounts</p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => { setEmail("hr@dayflow.demo"); setPassword("Demo@123"); }}
                className="w-full text-left text-xs text-neutral-400 hover:text-neutral-50 transition-colors py-1 px-2 rounded-lg hover:bg-neutral-50/5"
              >
                <span className="text-blue-400 font-medium">HR: </span>hr@dayflow.demo / Demo@123
              </button>
              <button
                type="button"
                onClick={() => { setEmail("employee@dayflow.demo"); setPassword("Demo@123"); }}
                className="w-full text-left text-xs text-neutral-400 hover:text-neutral-50 transition-colors py-1 px-2 rounded-lg hover:bg-neutral-50/5"
              >
                <span className="text-purple-400 font-medium">Employee: </span>employee@dayflow.demo / Demo@123
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-400">
            New employee?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
