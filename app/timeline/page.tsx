"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Zap, Clock, Calendar, ChevronRight } from "lucide-react";
import { workBlocksApi, attendanceApi } from "@/lib/api-client";
import { getDayStory, timeToPercent, getCurrentTimePercent, formatTime } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";

interface WorkBlock {
  id: string;
  startTime: string;
  endTime: string;
  category: string;
  description: string;
}

interface Attendance {
  checkIn?: string | null;
  checkOut?: string | null;
}

const CATEGORY_CONFIG = {
  DEEP_WORK: {
    label: "Deep Work",
    bg: "bg-violet-600/25",
    border: "border-violet-500/50",
    text: "text-violet-300",
    dot: "bg-violet-500",
    glow: "shadow-violet-500/30",
    accentBorder: "border-l-violet-500",
  },
  MEETING: {
    label: "Meeting",
    bg: "bg-teal-600/25",
    border: "border-teal-500/50",
    text: "text-teal-300",
    dot: "bg-teal-500",
    glow: "shadow-teal-500/30",
    accentBorder: "border-l-teal-500",
  },
  ADMIN: {
    label: "Admin",
    bg: "bg-amber-600/20",
    border: "border-amber-500/40",
    text: "text-amber-300",
    dot: "bg-amber-500",
    glow: "shadow-amber-500/30",
    accentBorder: "border-l-amber-500",
  },
  REST: {
    label: "Rest",
    bg: "bg-slate-600/15",
    border: "border-slate-500/30",
    text: "text-slate-400",
    dot: "bg-slate-500",
    glow: "",
    accentBorder: "border-l-slate-600",
  },
};

const TIME_LABELS = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"];

function DeepWorkBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
    >
      {children}
    </motion.div>
  );
}

function MeetingBorder({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="border-l-4 border-l-teal-500"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

function AdminBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ x: [0, 2, 0, -1, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={`${!done ? "typewriter" : ""}`}>{displayed}</span>
  );
}

function BlockWrapper({ category, children }: { category: string; children: React.ReactNode }) {
  if (category === "DEEP_WORK") return <DeepWorkBlock>{children}</DeepWorkBlock>;
  if (category === "MEETING") return <MeetingBorder>{children}</MeetingBorder>;
  if (category === "ADMIN") return <AdminBlock>{children}</AdminBlock>;
  return <>{children}</>;
}

export default function TimelinePage() {
  const { user } = useSession();
  const [blocks, setBlocks] = useState<WorkBlock[]>([]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [timePercent, setTimePercent] = useState(getCurrentTimePercent());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    async function fetchData() {
      try {
        const [wb, att] = await Promise.all([
          workBlocksApi.getMy() as Promise<WorkBlock[]>,
          attendanceApi.getToday() as Promise<Attendance | null>,
        ]);
        setBlocks(wb);
        setAttendance(att);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimePercent(getCurrentTimePercent());
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const dayStory = user && blocks.length > 0
    ? getDayStory({
        name: user.name,
        checkIn: attendance?.checkIn,
        checkOut: attendance?.checkOut,
        workBlocks: blocks,
        department: user.department,
      })
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 28 },
    },
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/3 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">Dayflow Pulse</h1>
        </div>
        <p className="text-neutral-400 ml-11">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Day Story */}
      {dayStory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-blue-500/20 bg-blue-500/5 card-shine"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Day Story</span>
          </div>
          <p className="text-white text-base leading-relaxed font-medium">
            <TypewriterText text={dayStory} />
          </p>
        </motion.div>
      )}

      {/* Check-in summary */}
      <div className="flex items-center gap-4 text-sm">
        {attendance?.checkIn && (
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/8">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-neutral-400">In:</span>
            <span className="text-green-400 font-medium">{formatTime(attendance.checkIn)}</span>
          </div>
        )}
        {attendance?.checkOut && (
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/8">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-neutral-400">Out:</span>
            <span className="text-blue-400 font-medium">{formatTime(attendance.checkOut)}</span>
          </div>
        )}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-neutral-400">
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      {blocks.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border border-white/8">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-500">No work blocks recorded for today</p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 border border-white/8 relative overflow-hidden">
          {/* Time ruler */}
          <div className="flex justify-between mb-6 text-xs text-neutral-600 font-medium">
            {TIME_LABELS.map(t => <span key={t}>{t}</span>)}
          </div>

          {/* Timeline track */}
          <div className="relative h-3 bg-white/5 rounded-full mb-8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-0 flex">
              {TIME_LABELS.slice(0, -1).map((_, i) => (
                <div key={i} className="flex-1 border-r border-white/5 last:border-0" />
              ))}
            </div>

            {/* Blocks on track */}
            {blocks.map(block => {
              const left = timeToPercent(block.startTime);
              const right = 100 - timeToPercent(block.endTime);
              const cfg = CATEGORY_CONFIG[block.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.ADMIN;
              return (
                <motion.div
                  key={block.id}
                  initial={{ scaleX: 0, originX: "left" }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`absolute inset-y-0 ${cfg.dot} opacity-70`}
                  style={{ left: `${left}%`, right: `${Math.max(0, right)}%` }}
                />
              );
            })}

            {/* Current time indicator */}
            {timePercent >= 0 && timePercent <= 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style={{ left: `${timePercent}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-blue-400 time-indicator" />
              </motion.div>
            )}
          </div>

          {/* Block cards with staggered entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {blocks.map((block) => {
              const cfg = CATEGORY_CONFIG[block.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.ADMIN;
              const expanded = expandedId === block.id;

              return (
                <motion.div key={block.id} variants={blockVariants} layout>
                  <BlockWrapper category={block.category}>
                    <motion.div
                      layoutId={`block-${block.id}`}
                      onClick={() => setExpandedId(expanded ? null : block.id)}
                      className={`rounded-xl border p-4 cursor-pointer transition-colors border-l-4 ${cfg.bg} ${cfg.border} ${cfg.accentBorder} hover:border-white/20`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>
                                {cfg.label}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {block.startTime} – {block.endTime}
                              </span>
                            </div>
                            <AnimatePresence>
                              {expanded && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-sm text-neutral-300 mt-2 leading-relaxed"
                                >
                                  {block.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            {!expanded && (
                              <p className="text-sm text-neutral-400 mt-1 truncate">{block.description}</p>
                            )}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </BlockWrapper>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Live time axis line */}
          {timePercent >= 0 && timePercent <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-blue-400/30 pointer-events-none"
              style={{ left: `${timePercent}%` }}
            >
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap time-indicator">
                Now
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
