"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { hrApi } from "@/lib/api-client";
import { formatTime, getInitials } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  employee: {
    user: { name: string; employeeId: string };
  };
}

export default function HRAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    hrApi.getAttendance(date)
      .then(d => setRecords(d as AttendanceRecord[]))
      .finally(() => setLoading(false));
  }, [date]);

  const present = records.filter(r => r.checkIn).length;
  const absent = records.length - present;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 font-['Space_Grotesk']">Attendance Overview</h1>
          <p className="text-neutral-400 mt-1">Team attendance for the selected date</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="glass border border-neutral-50/10 rounded-xl px-4 py-2 text-neutral-50 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", value: present, color: "text-green-400" },
          { label: "Absent / Unrecorded", value: absent, color: "text-red-400" },
          { label: "Total", value: records.length, color: "text-blue-400" },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 border border-neutral-50/8 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-neutral-500 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-neutral-50/8 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-neutral-50/3 rounded-xl animate-pulse" />)
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">No attendance records for this date</div>
        ) : records.map((r, i) => (
          <motion.div key={r.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50/3 transition-all border border-transparent hover:border-neutral-50/6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-neutral-50">
                {getInitials(r.employee.user.name)}
              </div>
              <div>
                <p className="text-neutral-50 text-sm font-medium">{r.employee.user.name}</p>
                <p className="text-neutral-500 text-xs">{r.employee.user.employeeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-neutral-500">Check In</p>
                <p className={r.checkIn ? "text-green-400 font-medium" : "text-neutral-600"}>{r.checkIn ? formatTime(r.checkIn) : "—"}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-neutral-500">Check Out</p>
                <p className={r.checkOut ? "text-blue-400 font-medium" : "text-neutral-600"}>{r.checkOut ? formatTime(r.checkOut) : "—"}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1 ${r.checkIn ? "badge-present" : "badge-absent"}`}>
                {r.checkIn ? <><CheckCircle className="w-3 h-3" />Present</> : <><XCircle className="w-3 h-3" />Absent</>}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
