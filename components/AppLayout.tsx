"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Clock, Calendar, DollarSign, User, Users,
  ClipboardList, LogOut, Zap, Bell, ChevronRight, Menu,
  ArrowLeft, Home, Sparkles, Settings, Moon, Sun, Megaphone
} from "lucide-react";
import { SessionProvider, useSession } from "@/context/SessionContext";
import { useTheme } from "next-themes";

const navEmployee = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/directory", icon: Users, label: "Directory" },
  { href: "/attendance", icon: Clock, label: "Attendance" },
  { href: "/leave", icon: Calendar, label: "Leave" },
  { href: "/payroll", icon: DollarSign, label: "Payroll" },
  { href: "/timeline", icon: Zap, label: "My Timeline" },
  { href: "/profile", icon: User, label: "Profile" },
];

const navHR = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/directory", icon: Users, label: "Directory" },
  { href: "/hr/employees", icon: Users, label: "Employees" },
  { href: "/hr/attendance", icon: Clock, label: "Attendance" },
  { href: "/hr/leaves", icon: ClipboardList, label: "Leave Requests" },
  { href: "/hr/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/hr/payroll", icon: DollarSign, label: "Payroll" },
  { href: "/timeline", icon: Zap, label: "Timeline" },
];

// Readable breadcrumb labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  leave: "Leave",
  payroll: "Payroll",
  timeline: "Timeline",
  profile: "Profile",
  notifications: "Notifications",
  hr: "HR",
  employees: "Employees",
  leaves: "Leave Requests",
  announcements: "Announcements",
  directory: "Directory",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 && segments[0] === "dashboard") return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <motion.nav
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-1.5 text-xs"
    >
      <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-50 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-neutral-700" />
          {crumb.isLast || crumb.href === "/hr" ? (
            <span className="text-neutral-50 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-neutral-500 hover:text-neutral-300 transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();
  
  // Prevent hydration mismatch for theme toggle
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isDark, setIsDark] = useState(true);

  const isDashboard = pathname === "/dashboard";

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

  // Current time display
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const nav = user?.role === "HR" ? navHR : navEmployee;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl"
        >
          <Zap className="w-7 h-7 text-neutral-50" fill="white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="text-neutral-400 text-sm"
        >
          Loading your workspace...
        </motion.p>
      </motion.div>
    </div>
  );

  if (!user) return null;

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
        className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-neutral-50/8 z-40 flex flex-col lg:translate-x-0 lg:static lg:z-auto"
      >
        {/* Logo */}
        <div className="p-5 border-b border-neutral-50/8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Zap className="w-4 h-4 text-neutral-50" fill="white" />
            </motion.div>
            <div>
              <div className="text-lg font-bold gradient-text font-['Space_Grotesk'] group-hover:opacity-80 transition-opacity tracking-tight">Dayflow.OS</div>
              <div className="text-xs text-neutral-500">{user.role === "HR" ? "Admin Console" : "Employee Portal"}</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item, i) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{  type: "spring", stiffness: 300, damping: 25 }}
                  onMouseEnter={() => setHoveredNav(item.href)}
                  onMouseLeave={() => setHoveredNav(null)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600/25 to-purple-600/15 text-neutral-50 border border-blue-500/25"
                      : "text-neutral-400 hover:text-neutral-50 hover:bg-neutral-50/5"
                  }`}
                >
                  {/* Hover indicator */}
                  <AnimatePresence>
                    {hoveredNav === item.href && !active && (
                      <motion.div
                        layoutId="nav-hover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="absolute inset-0 rounded-xl bg-neutral-50/5 border border-neutral-50/8"
                      />
                    )}
                  </AnimatePresence>
                  <item.icon className={`w-4 h-4 relative z-10 ${active ? "text-blue-400" : ""}`} />
                  <span className="font-medium relative z-10">{item.label}</span>
                  {active && (
                    <motion.div layoutId="active-pill" className="ml-auto">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-neutral-50/8">
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50/3 mb-2 hover:bg-neutral-50/6 transition-all cursor-pointer border border-transparent hover:border-neutral-50/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-neutral-50 overflow-hidden shrink-0">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-50 truncate">{user.name}</div>
                <div className="text-xs text-neutral-500 truncate">{user.department}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === "HR"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              }`}>{user.role}</span>
            </motion.div>
          </Link>
          <motion.button onClick={signOut} whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4" />Sign out
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        {/* Header with breadcrumbs & back button */}
        <header className="h-16 glass border-b border-neutral-50/8 flex items-center gap-4 px-6 shrink-0 relative z-50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-neutral-400 hover:text-neutral-50 transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {isDashboard && (
            <div className="font-bold text-neutral-50 text-lg tracking-tight font-['Space_Grotesk'] hidden lg:block mr-2">
              Dayflow<span className="text-blue-400">.OS</span>
            </div>
          )}

          {/* Back button — shown when not on dashboard */}
          {!isDashboard && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              whileHover={{ x: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-50 transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          )}

          {/* Breadcrumbs */}
          <Breadcrumbs />

          <div className="flex-1" />

          {/* Live clock */}
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
            <Sparkles className="w-3 h-3 text-blue-400/50" />
            {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </div>

          {/* Notifications & Theme Toggle */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" || (theme === "system" && systemTheme === "dark") ? "light" : "dark")}
                className="relative text-neutral-400 hover:text-neutral-50 transition-colors focus:outline-none"
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                  {theme === "dark" || (theme === "system" && systemTheme === "dark") ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </motion.div>
              </button>
            )}

            <Link href="/notifications" className="relative text-neutral-400 hover:text-neutral-50 transition-colors">
              <motion.div whileHover={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.4 }}>
                <Bell className="w-5 h-5" />
              </motion.div>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-neutral-50 font-bold"
                >
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
            </Link>

            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="text-neutral-400 hover:text-neutral-50 transition-colors focus:outline-none"
              >
                <motion.div whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                  <Settings className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setSettingsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute right-0 mt-3 w-56 bg-neutral-900 rounded-2xl border border-neutral-50/10 shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="px-3 py-2 border-b border-neutral-50/5 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-neutral-50 overflow-hidden shrink-0">
                          {user.photoUrl ? (
                            <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-neutral-50 truncate">{user.name}</div>
                          <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                        </div>
                      </div>
                      
                      <Link href="/profile" onClick={() => setSettingsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-300 hover:text-neutral-50 hover:bg-neutral-50/10 transition-colors text-sm">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      
                      <button 
                        onClick={() => {
                          setIsDark(!isDark);
                          document.documentElement.classList.toggle('dark');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-300 hover:text-neutral-50 hover:bg-neutral-50/10 transition-colors text-sm text-left"
                      >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 
                        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      </button>

                      <div className="h-px bg-neutral-50/5 my-2" />

                      <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm text-left">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content with route-based key for AnimatePresence */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
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
