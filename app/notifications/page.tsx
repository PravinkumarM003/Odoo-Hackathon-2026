"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck } from "lucide-react";
import { notificationsApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  LEAVE_APPROVED: "✅",
  LEAVE_REJECTED: "❌",
  LEAVE_REQUEST: "📋",
  PAYROLL: "💰",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetch() {
    const data = await notificationsApi.getMy() as Notification[];
    setNotifications(data);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  async function markAll() {
    await notificationsApi.markAllRead();
    fetch();
  }

  async function markOne(id: string) {
    await notificationsApi.markRead(id);
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk']">Notifications</h1>
          <p className="text-neutral-400 mt-1">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
        </div>
        {unread > 0 && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={markAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-neutral-50/10 text-neutral-400 hover:text-neutral-50 text-sm transition-all">
            <CheckCheck className="w-4 h-4" />Mark all read
          </motion.button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-50/3 rounded-xl animate-pulse" />)
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : notifications.map((n, i) => (
          <motion.div key={n.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => !n.read && markOne(n.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              n.read
                ? "bg-neutral-50/2 border-neutral-50/5 opacity-60 hover:opacity-80"
                : "bg-blue-500/6 border-blue-500/20 hover:border-blue-500/35"
            }`}
          >
            <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${n.read ? "text-neutral-500" : "text-neutral-200"}`}>
                {n.message}
              </p>
              <p className="text-xs text-neutral-600 mt-1">{formatDate(n.createdAt)}</p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
