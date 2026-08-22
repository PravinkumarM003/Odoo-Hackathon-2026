"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  Clock, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle,
  AlertCircle, Bell, ChevronRight, Users, Zap, Target, Activity
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";
import { attendanceApi, leaveApi, payrollApi, notificationsApi, hrApi } from "@/lib/api-client";
import { formatTime, formatDate, formatCurrency } from "@/lib/utils";
import { SpotlightCard } from "@/components/Animations";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  href?: string;
}

function StatCard({ icon, label, value, sub, color, href }: StatCardProps) {
  const content = (
    <SpotlightCard className="h-full">
      <motion.div
        variants={item}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`glass glass-hover h-full rounded-2xl p-5 flex items-start gap-4 cursor-pointer border border-white/8 ${href ? "hover:border-white/15" : ""}`}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color} animate-float`} style={{ animationDelay: `${Math.random()}s` }}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {sub && <div className="text-xs text-neutral-500 mt-0.5">{sub}</div>}
        </div>
        {href && <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0 mt-1 transition-transform group-hover:translate-x-1" />}
      </motion.div>
    </SpotlightCard>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const { user } = useSession();
  const [todayAttendance, setTodayAttendance] = useState<Record<string, unknown> | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, { total: number; used: number; remaining: number }> | null>(null);
  const [payroll, setPayroll] = useState<{ netSalary: number } | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; message: string; read: boolean; createdAt: string }>>([]);
  const [hrData, setHrData] = useState<{
    stats: { totalEmployees: number; attendanceRate: number; pendingLeaves: number; missingCheckouts: number };
    pendingLeaves: Array<{ id: string; employeeName: string; type: string; startDate: string; endDate: string }>;
    notCheckedIn: Array<{ id: string; name: string }>;
    missingCheckout: Array<{ attendanceId: string; employeeName: string; checkIn: string }>;
  } | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const isHR = user?.role === "HR";

  const fetchData = useCallback(async () => {
    try {
      const [att, notifs] = await Promise.all([
        attendanceApi.getToday() as Promise<Record<string, unknown> | null>,
        notificationsApi.getMy() as Promise<Array<{ id: string; type: string; message: string; read: boolean; createdAt: string }>>,
      ]);
      setTodayAttendance(att);
      setNotifications(notifs);

      if (!isHR) {
        const [bal, pay] = await Promise.all([
          leaveApi.getBalance() as Promise<typeof leaveBalance>,
          payrollApi.getMy() as Promise<{ netSalary: number } | null>,
        ]);
        setLeaveBalance(bal);
        setPayroll(pay);
      } else {
        const hr = await hrApi.getActionCenter() as typeof hrData;
        setHrData(hr);
      }
    } catch {
      // Silent fail — data may not be available
    }
  }, [isHR]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCheckIn() {
    setCheckLoading(true);
    setCheckError("");
    try {
      const rec = await attendanceApi.checkIn() as Record<string, unknown>;
      setTodayAttendance(rec);
    } catch (e) {
      setCheckError(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setCheckLoading(false);
    }
  }

  async function handleCheckOut() {
    setCheckLoading(true);
    setCheckError("");
    try {
      const rec = await attendanceApi.checkOut() as Record<string, unknown>;
      setTodayAttendance(rec);
    } catch (e) {
      setCheckError(e instanceof Error ? e.message : "Check-out failed");
    } finally {
      setCheckLoading(false);
    }
  }

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const unread = notifications.filter(n => !n.read).length;
  const checkedIn = !!(todayAttendance as { checkIn?: string } | null)?.checkIn;
  const checkedOut = !!(todayAttendance as { checkOut?: string } | null)?.checkOut;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-neutral-400 mt-1">
              {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/timeline">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 glass glass-hover px-4 py-2 rounded-xl text-sm text-neutral-300 hover:text-white border border-white/8"
            >
              <Zap className="w-4 h-4 text-blue-400" />
              View Timeline
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* HR Dashboard */}
      {isHR && hrData && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Employees" value={hrData.stats.totalEmployees} color="bg-blue-500/15" href="/hr/employees" />
            <StatCard icon={<Activity className="w-5 h-5 text-green-400" />} label="Attendance Rate" value={`${hrData.stats.attendanceRate}%`} sub="Last 30 days" color="bg-green-500/15" />
            <StatCard icon={<Calendar className="w-5 h-5 text-yellow-400" />} label="Pending Leaves" value={hrData.stats.pendingLeaves} sub="Awaiting action" color="bg-yellow-500/15" href="/hr/leaves" />
            <StatCard icon={<Clock className="w-5 h-5 text-red-400" />} label="Missing Checkouts" value={hrData.stats.missingCheckouts} sub="Today" color="bg-red-500/15" />
          </div>

          {/* Action Center */}
          <motion.div variants={item} className="glass rounded-2xl p-6 border border-white/8 card-shine">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Today's Attention</h2>
                <p className="text-xs text-neutral-500">Items requiring your action</p>
              </div>
            </div>

            <div className="space-y-3">
              {hrData.pendingLeaves.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Pending Leave Requests</p>
                  {hrData.pendingLeaves.map((leave) => (
                    <Link key={leave.id} href="/hr/leaves">
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                          <div>
                            <span className="text-sm text-white font-medium">{leave.employeeName}</span>
                            <span className="text-xs text-neutral-500 ml-2">{leave.type} leave</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}

              {hrData.missingCheckout.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Missing Checkout</p>
                  {hrData.missingCheckout.map((a) => (
                    <div key={a.attendanceId} className="flex items-center justify-between p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-sm text-white">{a.employeeName}</span>
                        <span className="text-xs text-neutral-500">checked in {formatTime(a.checkIn)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hrData.notCheckedIn.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Not Checked In Yet ({hrData.notCheckedIn.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hrData.notCheckedIn.slice(0, 6).map((e) => (
                      <span key={e.id} className="text-xs px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {e.name}
                      </span>
                    ))}
                    {hrData.notCheckedIn.length > 6 && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-neutral-800 text-neutral-500">
                        +{hrData.notCheckedIn.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {hrData.pendingLeaves.length === 0 && hrData.missingCheckout.length === 0 && hrData.notCheckedIn.length === 0 && (
                <div className="text-center py-6 text-neutral-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                  <p className="text-sm">All clear! No pending actions.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Employee Dashboard */}
      {!isHR && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Check-in/out card */}
          <SpotlightCard>
            <motion.div variants={item} className="glass rounded-2xl p-6 border border-white/8 card-shine relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none" />
              <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Today's Attendance</h2>
                <div className="flex items-center gap-4 mt-2">
                  {(todayAttendance as { checkIn?: string } | null)?.checkIn && (
                    <span className="text-sm text-neutral-400">
                      In: <span className="text-green-400 font-medium">{formatTime((todayAttendance as { checkIn?: string }).checkIn)}</span>
                    </span>
                  )}
                  {(todayAttendance as { checkOut?: string } | null)?.checkOut && (
                    <span className="text-sm text-neutral-400">
                      Out: <span className="text-blue-400 font-medium">{formatTime((todayAttendance as { checkOut?: string }).checkOut)}</span>
                    </span>
                  )}
                  {!checkedIn && (
                    <span className="text-sm text-neutral-500">Not checked in yet</span>
                  )}
                </div>
                {checkError && <p className="text-xs text-red-400 mt-1">{checkError}</p>}
              </div>
              <div className="flex gap-3">
                {!checkedIn && (
                  <motion.button
                    id="checkin-btn"
                    onClick={handleCheckIn}
                    disabled={checkLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glow flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {checkLoading ? <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Check In
                  </motion.button>
                )}
                {checkedIn && !checkedOut && (
                  <motion.button
                    id="checkout-btn"
                    onClick={handleCheckOut}
                    disabled={checkLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glow flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {checkLoading ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Check Out
                  </motion.button>
                )}
                {checkedIn && checkedOut && (
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Day complete
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </SpotlightCard>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Calendar className="w-5 h-5 text-green-400" />}
              label="Annual Leave Left"
              value={leaveBalance?.annual?.remaining ?? "—"}
              sub={`of ${leaveBalance?.annual?.total ?? 21} days`}
              color="bg-green-500/15"
              href="/leave"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-blue-400" />}
              label="Net Salary"
              value={payroll?.netSalary ? formatCurrency(payroll.netSalary) : "—"}
              sub="Annual package"
              color="bg-blue-500/15"
              href="/payroll"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
              label="Sick Leave Left"
              value={leaveBalance?.sick?.remaining ?? "—"}
              sub={`of ${leaveBalance?.sick?.total ?? 14} days`}
              color="bg-purple-500/15"
              href="/leave"
            />
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <motion.div variants={item} className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h2 className="text-white font-semibold">Recent Notifications</h2>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl text-sm border transition-all ${
                      n.read
                        ? "bg-white/2 border-white/5 text-neutral-500"
                        : "bg-blue-500/8 border-blue-500/20 text-neutral-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />}
                      <div>
                        <p className={n.read ? "text-neutral-500" : "text-neutral-200"}>{n.message}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{formatDate(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
