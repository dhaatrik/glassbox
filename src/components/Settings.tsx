import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { fetchEmployees, saveEmployees, Employee } from "../services/hrisService";

export function Settings() {
  const [profileName, setProfileName] = useState("Alex Chen");
  const [profileAvatar, setProfileAvatar] = useState("https://picsum.photos/seed/genz/100/100");
  
  const [statuses, setStatuses] = useState<string[]>([
    "🎧 Deep Work", "☕ Need Coffee", "🧠 Brainstorming", "🚀 Shipping"
  ]);
  const [newStatus, setNewStatus] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("ENGINEERING");
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editEmpName, setEditEmpName] = useState("");
  const [editEmpRole, setEditEmpRole] = useState("");
  const [editEmpDept, setEditEmpDept] = useState("");

  useEffect(() => {
    const storedProfile = localStorage.getItem("glassbox_profile");
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      if (p.name) setProfileName(p.name);
      if (p.avatar) setProfileAvatar(p.avatar);
      if (p.statuses) setStatuses(p.statuses);
    }

    fetchEmployees().then(data => setEmployees(data));
  }, []);

  const saveProfile = () => {
    localStorage.setItem("glassbox_profile", JSON.stringify({
      name: profileName,
      avatar: profileAvatar,
      statuses: statuses
    }));
    alert("Profile saved!");
  };

  const addStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus)) {
      setStatuses([...statuses, newStatus]);
      setNewStatus("");
    }
  };

  const removeStatus = (status: string) => {
    setStatuses(statuses.filter(s => s !== status));
  };

  const addEmployee = async () => {
    if (newEmpName.trim() && newEmpRole.trim() && newEmpDept.trim()) {
      const newEmp: Employee = {
        id: `EMP-${Math.floor(Math.random() * 10000)}`,
        name: newEmpName,
        role: newEmpRole,
        department: newEmpDept,
        email: `${newEmpName.split(' ')[0].toLowerCase()}@glassbox.local`
      };
      const updated = [...employees, newEmp];
      setEmployees(updated);
      await saveEmployees(updated);
      setNewEmpName("");
      setNewEmpRole("");
      setNewEmpDept("");
    }
  };

  const removeEmployee = async (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    await saveEmployees(updated);
  };

  const startEditing = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEditEmpName(emp.name);
    setEditEmpRole(emp.role);
    setEditEmpDept(emp.department);
  };

  const cancelEditing = () => {
    setEditingEmpId(null);
  };

  const saveEdit = async () => {
    if (editingEmpId && editEmpName.trim() && editEmpRole.trim() && editEmpDept.trim()) {
      const updated = employees.map(e => 
        e.id === editingEmpId 
          ? { ...e, name: editEmpName, role: editEmpRole, department: editEmpDept } 
          : e
      );
      setEmployees(updated);
      await saveEmployees(updated);
      setEditingEmpId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 relative overflow-y-auto p-6 max-w-4xl mx-auto w-full"
    >
      <header className="mb-8">
        <h1 className="text-white text-2xl font-bold tracking-[0.1em] uppercase font-display mb-2">
          Settings
        </h1>
        <p className="text-text-muted text-sm font-sans">
          Customize your profile, statuses, and HRIS identities.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <section className="glass-panel bento-card p-6 flex flex-col gap-4">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            User Profile
          </h2>
          
          <div className="flex items-center gap-4 mb-2">
            <img src={profileAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/50" referrerPolicy="no-referrer" />
            <div className="flex-1">
              <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-1 block">Avatar URL</label>
              <input 
                type="text" 
                value={profileAvatar} 
                onChange={e => setProfileAvatar(e.target.value)}
                className="w-full bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-1 block">Display Name</label>
            <input 
              type="text" 
              value={profileName} 
              onChange={e => setProfileName(e.target.value)}
              className="w-full bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
            />
          </div>

          <button onClick={saveProfile} className="mt-2 bg-primary text-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            Save Profile
          </button>
        </section>

        {/* Status Settings */}
        <section className="glass-panel bento-card p-6 flex flex-col gap-4">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            Custom Statuses
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <div key={s} className="flex items-center gap-2 bg-surface-dim/50 border border-border-dim px-3 py-1.5 rounded-full text-sm text-white">
                <span>{s}</span>
                <button onClick={() => removeStatus(s)} className="text-text-muted hover:text-critical transition-colors">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input 
              type="text" 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
              placeholder="e.g. 🍕 Lunch Break"
              className="flex-1 bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
            />
            <button onClick={addStatus} className="bg-surface border border-border-dim text-white font-bold text-sm px-4 py-2 rounded-lg hover:border-primary transition-colors">
              Add
            </button>
          </div>
          <button onClick={saveProfile} className="mt-2 text-primary font-bold text-xs hover:underline self-start">
            Save Statuses (with Profile)
          </button>
        </section>

        {/* HRIS Identity Settings */}
        <section className="glass-panel bento-card p-6 flex flex-col gap-4 md:col-span-2">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            HRIS Identities (Mock Data)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map(emp => (
              <div key={emp.id} className="bg-surface-dim/30 border border-border-dim p-3 rounded-xl flex flex-col justify-between">
                {editingEmpId === emp.id ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={editEmpName} 
                      onChange={e => setEditEmpName(e.target.value)}
                      className="w-full bg-surface-dim/50 border border-border-dim text-white text-xs px-2 py-1 rounded focus:border-primary outline-none"
                    />
                    <input 
                      type="text" 
                      value={editEmpRole} 
                      onChange={e => setEditEmpRole(e.target.value)}
                      className="w-full bg-surface-dim/50 border border-border-dim text-white text-xs px-2 py-1 rounded focus:border-primary outline-none"
                    />
                    <select 
                      value={editEmpDept} 
                      onChange={e => setEditEmpDept(e.target.value)}
                      className="w-full bg-surface-dim/50 border border-border-dim text-white text-xs px-2 py-1 rounded focus:border-primary outline-none appearance-none cursor-pointer"
                    >
                      {["ENGINEERING", "MARKETING", "HUMAN RESOURCES", "EXECUTIVE", "DESIGN", "FACILITIES", "FINANCE", "OPERATIONS", "SALES", "PRODUCT", "LEGAL"].map(d => (
                        <option key={d} value={d} className="bg-background-dark text-white">{d}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} className="flex-1 bg-primary text-black font-bold text-[10px] py-1 rounded hover:bg-primary/90 transition-colors">
                        SAVE
                      </button>
                      <button onClick={cancelEditing} className="flex-1 bg-surface border border-border-dim text-white font-bold text-[10px] py-1 rounded hover:border-primary transition-colors">
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold text-sm">{emp.name}</p>
                        <p className="text-text-muted text-xs">{emp.role}</p>
                        <p className="text-primary text-[10px] font-mono mt-1">{emp.department}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => startEditing(emp)} className="text-text-muted hover:text-primary transition-colors p-1">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => removeEmployee(emp.id)} className="text-text-muted hover:text-critical transition-colors p-1">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border-dim pt-4 flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={newEmpName} 
              onChange={e => setNewEmpName(e.target.value)}
              placeholder="Name"
              className="flex-1 bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
            />
            <input 
              type="text" 
              value={newEmpRole} 
              onChange={e => setNewEmpRole(e.target.value)}
              placeholder="Role"
              className="flex-1 bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
            />
            <select 
              value={newEmpDept} 
              onChange={e => setNewEmpDept(e.target.value)}
              className="flex-1 bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors appearance-none cursor-pointer"
            >
              {["ENGINEERING", "MARKETING", "HUMAN RESOURCES", "EXECUTIVE", "DESIGN", "FACILITIES", "FINANCE", "OPERATIONS", "SALES", "PRODUCT", "LEGAL"].map(d => (
                <option key={d} value={d} className="bg-background-dark text-white">{d}</option>
              ))}
            </select>
            <button onClick={addEmployee} className="bg-primary text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Add Identity
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
