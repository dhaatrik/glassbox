import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchEmployees, saveEmployees, Employee } from "../services/hrisService";

export function Settings() {
  const [profileName, setProfileName] = useState("Alex Chen");
  const [profileAvatar, setProfileAvatar] = useState("https://picsum.photos/seed/genz/100/100");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [statuses, setStatuses] = useState<string[]>([
    "🎧 Deep Work", "☕ Need Coffee", "🧠 Brainstorming", "🚀 Shipping"
  ]);
  const [newStatus, setNewStatus] = useState("");
  const [editingStatusIndex, setEditingStatusIndex] = useState<number | null>(null);
  const [editStatusText, setEditStatusText] = useState("");
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("ENGINEERING");
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editEmpName, setEditEmpName] = useState("");
  const [editEmpRole, setEditEmpRole] = useState("");
  const [editEmpDept, setEditEmpDept] = useState("");
  const [empToDelete, setEmpToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"Name" | "Role" | "Dept">("Name");

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    localStorage.setItem("glassbox_profile", JSON.stringify({
      name: profileName,
      avatar: profileAvatar,
      statuses: statuses
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus) && statuses.length < 6) {
      const updatedStatuses = [...statuses, newStatus];
      setStatuses(updatedStatuses);
      setNewStatus("");
      localStorage.setItem("glassbox_profile", JSON.stringify({
        name: profileName,
        avatar: profileAvatar,
        statuses: updatedStatuses
      }));
    }
  };

  const startEditingStatus = (index: number, status: string) => {
    setEditingStatusIndex(index);
    setEditStatusText(status);
  };

  const saveEditedStatus = (index: number) => {
    if (editStatusText.trim()) {
      const updatedStatuses = [...statuses];
      updatedStatuses[index] = editStatusText;
      setStatuses(updatedStatuses);
      setEditingStatusIndex(null);
      localStorage.setItem("glassbox_profile", JSON.stringify({
        name: profileName,
        avatar: profileAvatar,
        statuses: updatedStatuses
      }));
    }
  };

  const confirmRemoveStatus = () => {
    if (statusToDelete) {
      const updatedStatuses = statuses.filter(s => s !== statusToDelete);
      setStatuses(updatedStatuses);
      setStatusToDelete(null);
      localStorage.setItem("glassbox_profile", JSON.stringify({
        name: profileName,
        avatar: profileAvatar,
        statuses: updatedStatuses
      }));
    }
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

  const removeEmployee = (id: string) => {
    setEmpToDelete(id);
  };

  const confirmRemoveEmployee = async () => {
    if (empToDelete) {
      const updated = employees.filter(e => e.id !== empToDelete);
      setEmployees(updated);
      await saveEmployees(updated);
      setEmpToDelete(null);
    }
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

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (searchField === "Name") return emp.name.toLowerCase().includes(query);
    if (searchField === "Role") return emp.role.toLowerCase().includes(query);
    if (searchField === "Dept") return emp.department.toLowerCase().includes(query);
    return true;
  });

  return (
    <>
      <header className="flex-none border-b border-border-dim bg-surface-dim/80 backdrop-blur-2xl z-40">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-primary text-xl"
              >
                settings
              </motion.span>
              <p className="text-xs text-text-muted font-sans font-bold tracking-widest uppercase">
                System Configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.reload()}
                className="text-text-muted hover:text-critical transition-colors p-1.5 rounded-full hover:bg-surface-dim"
                title="Disconnect"
              >
                <span className="material-symbols-outlined text-lg">
                  power_settings_new
                </span>
              </motion.button>
            </div>
          </div>
          <h1 className="text-white tracking-tight text-2xl md:text-3xl font-bold font-display leading-tight mt-2 mb-2">
            Settings <span className="text-text-muted font-sans font-normal mx-2">/</span> Preferences
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Settings */}
        <section className="glass-panel bento-card p-4 sm:p-6 flex flex-col gap-4">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            User Profile
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-2 sm:mb-4">
            <div className="relative group w-24 h-24 sm:w-20 sm:h-20 shrink-0">
              <img src={profileAvatar} alt="Avatar" className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/50" referrerPolicy="no-referrer" />
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity border border-dashed border-primary/50">
                <span className="material-symbols-outlined text-white text-xl mb-0.5">photo_camera</span>
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-1 block text-center sm:text-left">Display Name</label>
              <input 
                type="text" 
                value={profileName} 
                onChange={e => setProfileName(e.target.value)}
                className="w-full bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors text-center sm:text-left"
              />
            </div>
          </div>

          <button onClick={saveProfile} className="mt-2 bg-primary text-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2">
            {saveSuccess ? (
              <>
                <span className="material-symbols-outlined text-sm">check</span>
                Saved!
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </section>

        {/* Status Settings */}
        <section className="glass-panel bento-card p-4 sm:p-6 flex flex-col gap-4">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            Custom Statuses
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {statuses.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface-dim/50 border border-border-dim px-3 py-1.5 rounded-full text-sm text-white">
                {editingStatusIndex === idx ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editStatusText} 
                      onChange={e => setEditStatusText(e.target.value)}
                      maxLength={20}
                      className="bg-surface border border-border-dim text-white text-xs px-2 py-1 rounded outline-none w-24"
                      autoFocus
                    />
                    <button onClick={() => saveEditedStatus(idx)} className="text-primary hover:text-primary/80">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </button>
                    <button onClick={() => setEditingStatusIndex(null)} className="text-text-muted hover:text-white">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{s}</span>
                    <button onClick={() => startEditingStatus(idx, s)} className="text-text-muted hover:text-primary transition-colors ml-1">
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button onClick={() => setStatusToDelete(s)} className="text-text-muted hover:text-critical transition-colors">
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <input 
              type="text" 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
              maxLength={20}
              placeholder="e.g. 🍕 Lunch Break"
              disabled={statuses.length >= 6}
              className="flex-1 bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors disabled:opacity-50"
            />
            <button 
              onClick={handleSaveStatus} 
              disabled={statuses.length >= 6 || !newStatus.trim()}
              className="bg-primary text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              Save
            </button>
          </div>
          {statuses.length >= 6 && (
            <p className="text-critical text-xs mt-1">Maximum of 6 custom statuses reached.</p>
          )}
        </section>

        {/* HRIS Identity Settings */}
        <section className="glass-panel bento-card p-4 sm:p-6 flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2">
            HRIS Identities
          </h2>

          <div className="flex flex-col md:flex-row gap-3 mb-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-text-muted text-sm">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search identities..."
                className="w-full bg-surface-dim/50 border border-border-dim text-white text-sm pl-9 pr-3 py-2 rounded-lg focus:border-primary outline-none transition-colors"
              />
            </div>
            <select 
              value={searchField}
              onChange={e => setSearchField(e.target.value as any)}
              className="bg-surface-dim/50 border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none transition-colors appearance-none cursor-pointer sm:w-32"
            >
              <option value="Name" className="bg-background-dark">Name</option>
              <option value="Role" className="bg-background-dark">Role</option>
              <option value="Dept" className="bg-background-dark">Dept</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredEmployees.map(emp => (
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

          <div className="mt-4 border-t border-border-dim pt-4 flex flex-col md:flex-row gap-3">
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
            <button onClick={addEmployee} className="bg-primary text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto">
              Add Identity
            </button>
          </div>
        </section>
      </div>
    </main>

      <AnimatePresence>
        {/* Delete Status Modal */}
        {statusToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-border-dim p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4"
            >
              <h3 className="text-white font-bold text-lg mb-2">Delete Status</h3>
              <p className="text-text-muted text-sm mb-6">Are you sure you want to delete the status "{statusToDelete}"?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setStatusToDelete(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:text-white transition-colors">Cancel</button>
                <button onClick={confirmRemoveStatus} className="px-4 py-2 text-sm font-bold bg-critical text-black rounded-lg hover:bg-critical/90 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Employee Modal */}
        {empToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-border-dim p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4"
            >
              <h3 className="text-white font-bold text-lg mb-2">Delete Identity</h3>
              <p className="text-text-muted text-sm mb-6">Are you sure you want to delete this HRIS identity?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEmpToDelete(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:text-white transition-colors">Cancel</button>
                <button onClick={confirmRemoveEmployee} className="px-4 py-2 text-sm font-bold bg-critical text-black rounded-lg hover:bg-critical/90 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
