"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Clock, Calendar, DollarSign, User, Users,
  ClipboardList, LogOut, Zap, Bell, ChevronRight, Menu, X
} from "lucide-react";
import { SessionProvider, useSession } from "@/context/SessionContext";

const navEmployee = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/attendance", icon: Clock, label: "Attendance" },
  { href: "/leave", icon: Calendar, label: "Leave" },
  { href: "/payroll", icon: DollarSign, label: "Payroll" },
  { href: "/timeline", icon: Zap, label: "My Timeline" },
  { href: "/profile", icon: User, label: "Profile" },
];

const navHR = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/hr/employees", icon: Users, label: "Employees" },
  { href: "/hr/attendance", icon: Clock, label: "Attendance" },
  { href: "/hr/leaves", icon: ClipboardList, label: "Leave Requests" },
  { href: "/hr/payroll", icon: DollarSign, label: "Payroll" },
  { href: "/timeline", icon: Zap, label: "Timeline" },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications", { credentials: "include" })
      .then(r => r.json())
      .then((ns: Array<{ read: boolean }>) => setUnread(ns.filter(n => !n.read).length))
      .catch(() => {});
  }, [user, pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const nav = user.role === "HR" ? navHR : navEmployee;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/8 z-40 flex flex-col lg:translate-x-0 lg:static lg:z-auto"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <div className="text-lg font-bold gradient-text font-['Space_Grotesk']">Dayflow</div>
              <div className="text-xs text-neutral-500">{user.role === "HR" ? "HR Portal" : "My Workspace"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600/25 to-purple-600/15 text-white border border-blue-500/25"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-blue-400" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-neutral-500 truncate">{user.department}</div>
            </div>
          </div>
          <motion.button onClick={signOut} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4" />Sign out
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 glass border-b border-white/8 flex items-center gap-4 px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-neutral-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link href="/notifications" className="relative text-neutral-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
