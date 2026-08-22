"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserCircle, Building, Mail, Clock, Hash } from "lucide-react";
import { SpotlightCard } from "@/components/Animations";
import { formatTime } from "@/lib/utils";

interface DirectoryEmployee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  isOnline: boolean;
  checkInTime: string | null;
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<DirectoryEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/directory")
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      });
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Space_Grotesk']">Colleague Directory</h1>
          <p className="text-neutral-400 mt-1">Connect with your team members across the company</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search by name, role or dept..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white/3 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children"
        >
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map((emp, i) => (
              <SpotlightCard key={emp.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 border border-white/8 flex flex-col h-full card-interactive"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                          {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${emp.isOnline ? "bg-green-500" : "bg-neutral-500"}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{emp.name}</h3>
                        <p className="text-xs text-neutral-400">{emp.designation}</p>
                      </div>
                    </div>
                    {emp.isOnline && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Online
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Building className="w-3.5 h-3.5 text-neutral-500" />
                      {emp.department}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      {emp.email}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Hash className="w-3.5 h-3.5" />
                        {emp.employeeId}
                      </div>
                      {emp.isOnline && emp.checkInTime && (
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <Clock className="w-3 h-3" />
                          In since {formatTime(emp.checkInTime)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </SpotlightCard>
            ))}
          </AnimatePresence>
          
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No colleagues found matching "{search}"</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
