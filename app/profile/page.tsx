"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Building, Briefcase, Phone, MapPin, Save } from "lucide-react";
import { profileApi } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";

interface Profile {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: string;
  department: string;
  designation: string;
  phone?: string | null;
  address?: string | null;
}

export default function ProfilePage() {
  const { user, refresh } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    profileApi.get().then(d => {
      const p = d as Profile;
      setProfile(p);
      setForm({ name: p.name, phone: p.phone ?? "", address: p.address ?? "" });
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await profileApi.update(form);
      setSuccess("Profile updated!");
      setEditing(false);
      await refresh();
      const p = await profileApi.get() as Profile;
      setProfile(p);
      setTimeout(() => setSuccess(""), 3000);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  if (!profile) return <div className="max-w-2xl mx-auto h-64 bg-white/3 rounded-2xl animate-pulse" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">My Profile</h1>

      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ {success}
        </motion.div>
      )}

      {/* Avatar + header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 border border-white/8 card-shine"
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {getInitials(profile.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-neutral-400">{profile.designation}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {profile.employeeId}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                profile.role === "HR"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
              }`}>{profile.role}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Details</h3>
          {!editing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all"
            >
              Edit Profile
            </motion.button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            {[
              { icon: User, label: "Full Name", key: "name", type: "text" },
              { icon: Phone, label: "Phone", key: "phone", type: "tel" },
              { icon: MapPin, label: "Address", key: "address", type: "text" },
            ].map(({ icon: Icon, label, key, type }) => (
              <div key={key}>
                <label className="block text-sm text-neutral-400 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm"
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-neutral-400 text-sm hover:text-white transition-all">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Email", value: profile.email },
              { icon: Building, label: "Department", value: profile.department },
              { icon: Briefcase, label: "Designation", value: profile.designation },
              { icon: Phone, label: "Phone", value: profile.phone ?? "Not set" },
              { icon: MapPin, label: "Address", value: profile.address ?? "Not set" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500">{label}</p>
                  <p className="text-sm text-white truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
