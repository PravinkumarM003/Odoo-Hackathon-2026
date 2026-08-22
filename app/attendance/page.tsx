"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { attendanceApi } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceApi.getMy(14)
      .then(d => setRecords(d as AttendanceRecord[]))
      .finally(() => setLoading(false));
  }, []);

  const presentDays = records.filter(r => r.checkIn).length;
  const totalDays = records.length;
  const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk']">Attendance</h1>
        <p className="text-neutral-400 mt-1">Your attendance history (last 14 days)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", value: presentDays, color: "text-green-400" },
          { label: "Absent", value: totalDays - presentDays, color: "text-red-400" },
          { label: "Attendance Rate", value: `${rate}%`, color: "text-blue-400" },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 border border-neutral-50/8 text-center"
          >
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-neutral-500 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Records */}
      <div className="glass rounded-2xl p-6 border border-neutral-50/8 space-y-2">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-14 bg-neutral-50/3 rounded-xl animate-pulse" />
          ))
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">No attendance records found</div>
        ) : (
          records.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50/3 transition-colors border border-transparent hover:border-neutral-50/6"
            >
              <div className="flex items-center gap-3">
                {r.checkIn
                  ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <div>
                  <p className="text-neutral-50 text-sm font-medium">{formatDate(r.date)}</p>
                  <p className="text-neutral-500 text-xs">
                    {new Date(r.date).toLocaleDateString("en-US", { weekday: "long" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Check In</p>
                  <p className={r.checkIn ? "text-green-400 font-medium" : "text-neutral-600"}>
                    {r.checkIn ? formatTime(r.checkIn) : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Check Out</p>
                  <p className={r.checkOut ? "text-blue-400 font-medium" : "text-neutral-600"}>
                    {r.checkOut ? formatTime(r.checkOut) : "—"}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  r.checkIn ? "badge-present" : "badge-absent"
                }`}>
                  {r.checkIn ? "Present" : "Absent"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
