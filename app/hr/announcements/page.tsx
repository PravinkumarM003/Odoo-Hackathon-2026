"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Plus, AlertCircle, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  author: { name: string };
}

export default function HRAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, priority })
      });
      setTitle("");
      setContent("");
      setPriority("NORMAL");
      setShowForm(false);
      fetchAnnouncements();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto"><div className="h-24 bg-neutral-50/3 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50 font-display">Announcements</h1>
          <p className="text-neutral-400 mt-1">Broadcast messages to the entire company</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="btn-glow flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-neutral-50 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-6 border border-neutral-50/8 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Townhall Meeting This Friday" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Message</label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} rows={4}
                className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Write your announcement..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full bg-neutral-50/5 border border-neutral-50/10 rounded-xl px-4 py-2.5 text-neutral-50 focus:outline-none focus:border-blue-500 transition-colors [&>option]:bg-neutral-900">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-neutral-400 hover:bg-neutral-50/5 transition-colors text-sm font-medium">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-neutral-50 transition-colors text-sm font-semibold disabled:opacity-50">
                {submitting ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4 stagger-children">
        {announcements.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-neutral-50/8">
            <Megaphone className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-500">No announcements posted yet</p>
          </div>
        ) : (
          announcements.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ }}
              className={`glass rounded-2xl p-5 border ${ann.priority === "HIGH" ? "border-red-500/20 bg-red-500/5" : "border-neutral-50/8"} card-interactive`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ann.priority === "HIGH" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-neutral-50 font-semibold flex items-center gap-2">
                      {ann.title}
                      {ann.priority === "HIGH" && <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">Important</span>}
                    </h3>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      Posted by {ann.author.name} • {formatDate(ann.createdAt)} at {formatTime(ann.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-neutral-300 text-sm mt-3 leading-relaxed whitespace-pre-wrap pl-13">
                {ann.content}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
