import React, { useState, useEffect, useRef } from "react";
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

  const [activeTab, setActiveTab] = useState<"IDENTITY" | "SYSTEM" | "INTEGRATIONS" | "DANGER">("IDENTITY");
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("glassbox_theme") || "CYBER");
  const [auditLogs, setAuditLogs] = useState<{time: string, action: string}[]>([]);
  const [bulkImportText, setBulkImportText] = useState("");
  const parallaxRef = useRef<HTMLDivElement>(null);

  const [integrations, setIntegrations] = useState([
    { id: "s7db", name: "Sector 7 Database", status: "Connected", icon: "database", type: "DATA" },
    { id: "qek", name: "Quantum Encryption Key", status: "Active", icon: "key", type: "SECURITY" },
    { id: "eupl", name: "External Uplink", status: "Offline", icon: "satellite_alt", type: "NETWORK" }
  ]);

  const [isPurging, setIsPurging] = useState(false);
  const [showFactoryResetConf, setShowFactoryResetConf] = useState(false);

  useEffect(() => {
    // Initial Theme Load
    const theme = localStorage.getItem("glassbox_theme") || "CYBER";
    document.documentElement.classList.remove("theme-cyan", "theme-void");
    if (theme === "CYBER") document.documentElement.classList.add("theme-cyan");
    if (theme === "VOID") document.documentElement.classList.add("theme-void");
  }, []);

  useEffect(() => {
    setAuditLogs(prev => [{ time: new Date().toLocaleTimeString(), action: "System configuration module accessed" }, ...prev]);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      parallaxRef.current.style.transform = `translate(${x}px, ${y}px) rotateX(${-y * 0.5}deg) rotateY(${x * 0.5}deg)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const addAuditLog = (action: string) => {
    setAuditLogs(prev => [{ time: new Date().toLocaleTimeString(), action }, ...prev].slice(0, 10));
  };

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
        addAuditLog("Avatar biometric data updated");
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
    addAuditLog(`Profile configuration saved for ${profileName}`);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus) && statuses.length < 6) {
      const updatedStatuses = [...statuses, newStatus];
      setStatuses(updatedStatuses);
      setNewStatus("");
      addAuditLog(`Created new status protocols: ${newStatus}`);
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
      addAuditLog(`Modified status protocol from ${statuses[index]} to ${editStatusText}`);
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
      addAuditLog(`Deleted status protocol: ${statusToDelete}`);
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
      addAuditLog(`Provisioned new HRIS identity: ${newEmp.id}`);
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
      addAuditLog(`Terminated HRIS identity: ${empToDelete}`);
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
      addAuditLog(`Updated HRIS identity configuration: ${editingEmpId}`);
      setEditingEmpId(null);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return;
    try {
      const data = JSON.parse(bulkImportText);
      if (Array.isArray(data)) {
        const newEmps = data.map((item: any) => ({
          id: `EMP-${Math.floor(Math.random() * 10000)}`,
          name: item.name || "Unknown",
          role: item.role || "Unknown",
          department: item.department || "ENGINEERING",
          email: item.email || `${(item.name || 'user').split(' ')[0].toLowerCase()}@glassbox.local`
        }));
        const updated = [...employees, ...newEmps];
        setEmployees(updated);
        await saveEmployees(updated);
        addAuditLog(`Bulk imported ${newEmps.length} neural patterns`);
        setBulkImportText("");
      }
    } catch (e) {
      addAuditLog(`Failed bulk import: Invalid JSON format`);
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

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === id) {
        const newStatus = int.status === "Offline" ? (int.id === "qek" ? "Active" : "Connected") : "Offline";
        addAuditLog(`Integration ${int.name} toggled to ${newStatus}`);
        return { ...int, status: newStatus };
      }
      return int;
    }));
  };

  const purgeCache = () => {
    setIsPurging(true);
    addAuditLog("Initiated Neural Cache Purge");
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Purging Neural Cache...' }));
    setTimeout(() => {
      sessionStorage.clear();
      setIsPurging(false);
      addAuditLog("Neural Cache Purged Successfully");
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Neural Cache Purged Successfully' }));
    }, 1500);
  };

  const factoryReset = () => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Grid Erased. Rebooting...' }));
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }, 500);
  };

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem("glassbox_theme", theme);
    addAuditLog(`Theme Matrix shifted to ${theme}`);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: `System visually updated to ${theme} Protocol` }));

    document.documentElement.classList.remove("theme-cyan", "theme-void");
    if (theme === "CYBER") document.documentElement.classList.add("theme-cyan");
    if (theme === "VOID") document.documentElement.classList.add("theme-void");
  };

  const exportMatrix = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "glassbox_neural_grid_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addAuditLog("Exported Neural Grid Matrix");
    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Neural Matrix Exported' }));
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col font-mono text-white selection:bg-primary/30">
      {/* Parallax Background Environment */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" ref={parallaxRef}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff11_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff11_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#ff003c]/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="flex-none border-b border-border-dim bg-surface-dim/80 backdrop-blur-2xl z-40 relative">
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
            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-xs flex-wrap max-w-[280px]">
                {["CYBER", "VOID"].map(theme => (
                  <button 
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors duration-300 font-medium tracking-wide ${activeTheme === theme ? 'border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--color-primary),0.2)]' : 'border-border-dim text-text-muted hover:border-text-muted hover:text-white bg-surface-dim'}`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
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
          <h1 className="text-white tracking-tight text-2xl md:text-3xl font-bold font-display leading-tight mt-2 mb-2 uppercase">
            Control Node
          </h1>

          {/* Categorized Tab Architecture */}
          <div className="flex gap-4 border-b border-border-dim mt-2">
            {[
              { id: "IDENTITY", icon: "badge", label: "Identity & Personas" },
              { id: "SYSTEM", icon: "dns", label: "HRIS Neural Grid" },
              { id: "INTEGRATIONS", icon: "api", label: "Integrations" },
              { id: "DANGER", icon: "warning", label: "Substation" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span className="text-xs font-bold tracking-wider uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full relative z-10 flex gap-6">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "IDENTITY" && (
              <motion.div key="identity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                {/* Cinematic Avatar Uploader / Live Holographic ID Cards */}
                <section className="glass-panel p-6 border border-border-dim relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                  <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">assignment_ind</span>
                    Holographic ID Configuration
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-xl"></div>
                      <img src={profileAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-surface shadow-[0_0_20px_var(--color-primary)] opacity-80" referrerPolicy="no-referrer" />
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 hover:opacity-100 cursor-pointer transition-opacity border-2 border-dashed border-primary">
                        <span className="material-symbols-outlined text-white text-2xl mb-1 group-hover:scale-110 transition-transform">scan</span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Sync Retina</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                      <div className="absolute -bottom-2 -right-2 bg-surface border border-primary px-2 py-1 text-[9px] rounded font-bold text-primary shadow-lg">LIVE</div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Designation Name</label>
                        <input 
                          type="text" 
                          value={profileName} 
                          onChange={e => setProfileName(e.target.value)}
                          className="w-full bg-surface-dim border border-border-dim text-white text-lg px-4 py-3 rounded-lg focus:border-primary outline-none transition-all font-display tracking-wide focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      
                      {/* Auto-Status Scheduler */}
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex justify-between items-center">
                          <span>Status Protocols</span>
                          <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded">Auto-Schedule Ready</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {statuses.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-surface-dim border border-border-dim px-3 py-1.5 rounded-md text-sm text-white hover:border-primary/50 transition-colors">
                              {editingStatusIndex === idx ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    value={editStatusText} 
                                    onChange={e => setEditStatusText(e.target.value)}
                                    maxLength={20}
                                    className="bg-transparent border-b border-primary text-white text-xs px-1 py-0.5 outline-none w-24"
                                    autoFocus
                                  />
                                  <button onClick={() => saveEditedStatus(idx)} className="text-primary"><span className="material-symbols-outlined text-[14px]">check</span></button>
                                  <button onClick={() => setEditingStatusIndex(null)} className="text-text-muted"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                </div>
                              ) : (
                                <>
                                  <span className="font-sans font-medium">{s}</span>
                                  <button onClick={() => startEditingStatus(idx, s)} className="text-text-muted hover:text-primary transition-colors ml-1"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                                  <button onClick={() => setStatusToDelete(s)} className="text-text-muted hover:text-critical transition-colors"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newStatus} 
                            onChange={e => setNewStatus(e.target.value)}
                            maxLength={20}
                            placeholder="Initialize new protocol..."
                            disabled={statuses.length >= 6}
                            className="flex-1 bg-surface-dim border border-border-dim text-white text-sm px-3 py-2 rounded-lg focus:border-primary outline-none disabled:opacity-50"
                          />
                          <button onClick={handleSaveStatus} disabled={statuses.length >= 6 || !newStatus.trim()} className="bg-surface text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 font-bold text-xs">
                            ADD
                          </button>
                        </div>
                      </div>

                      <button onClick={saveProfile} className="mt-4 bg-primary text-black font-bold text-sm px-6 py-3 rounded-lg hover:bg-white transition-colors shadow-[0_0_15px_var(--color-primary)] opacity-90 hover:opacity-100 flex items-center justify-center gap-2 w-full md:w-auto uppercase tracking-wider">
                        {saveSuccess ? <><span className="material-symbols-outlined text-sm">check</span> Identity Synced</> : "Compile Identity"}
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "SYSTEM" && (
              <motion.div key="system" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                <section className="glass-panel p-6 border border-border-dim">
                  <div className="flex justify-between items-center border-b border-border-dim pb-4 mb-4">
                    <h2 className="text-primary text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">grid_view</span>
                      Neural Grid Roster
                    </h2>
                    <div className="flex gap-2">
                       <button onClick={exportMatrix} className="text-[10px] bg-primary/10 text-primary px-2 py-1 border border-primary/30 rounded uppercase font-bold flex items-center gap-1 hover:bg-primary/20">
                          <span className="material-symbols-outlined text-[14px]">download</span> Export Matrix
                       </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1 group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-text-muted text-sm group-focus-within:text-primary transition-colors">search</span>
                      <input 
                        type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Query neural patterns..."
                        className="w-full bg-surface-dim border border-border-dim text-white text-sm pl-9 pr-3 py-2 rounded-lg focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div className="relative flex">
                      <select 
                        value={searchField} onChange={e => setSearchField(e.target.value as any)}
                        className="bg-surface-dim border border-border-dim text-white text-sm pl-4 pr-10 py-2 rounded-lg focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary/50 cursor-pointer appearance-none w-full sm:w-36 [color-scheme:dark]"
                      >
                        <option value="Name" className="bg-background-dark text-white font-sans">Name</option>
                        <option value="Role" className="bg-background-dark text-white font-sans">Role</option>
                        <option value="Dept" className="bg-background-dark text-white font-sans">Dept</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">expand_more</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Add New Node Card */}
                    <div className="bg-surface border border-dashed border-border-dim hover:border-primary/50 transition-colors p-4 rounded-xl flex flex-col justify-center items-center min-h-[140px] opacity-70 hover:opacity-100">
                       <div className="w-full space-y-2">
                          <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="Designation" className="w-full bg-surface-dim border border-border-dim text-xs px-2 py-1.5 focus:border-primary outline-none rounded" />
                          <input type="text" value={newEmpRole} onChange={e => setNewEmpRole(e.target.value)} placeholder="Function" className="w-full bg-surface-dim border border-border-dim text-xs px-2 py-1.5 focus:border-primary outline-none rounded" />
                          <div className="flex gap-2">
                             <div className="relative flex-1">
                               <select value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)} className="w-full bg-surface-dim border border-border-dim text-xs pl-2 pr-8 py-1.5 focus:border-primary outline-none rounded appearance-none cursor-pointer text-white [color-scheme:dark]">
                                 {["ENGINEERING", "MARKETING", "HUMAN RESOURCES", "EXECUTIVE", "DESIGN"].map(d => (
                                   <option key={d} value={d} className="bg-background-dark text-white font-sans">{d}</option>
                                 ))}
                               </select>
                               <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[14px]">expand_more</span>
                             </div>
                             <button onClick={addEmployee} className="bg-primary text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-white transition-colors">ADD</button>
                          </div>
                       </div>
                    </div>

                    {filteredEmployees.map(emp => (
                      <div key={emp.id} className="group relative bg-surface-dim/40 border border-border-dim p-4 rounded-xl hover:border-primary/30 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {editingEmpId === emp.id ? (
                          <div className="space-y-2 relative z-10">
                            <input type="text" value={editEmpName} onChange={e => setEditEmpName(e.target.value)} className="w-full bg-surface border border-primary text-white text-xs px-2 py-1 rounded outline-none" />
                            <input type="text" value={editEmpRole} onChange={e => setEditEmpRole(e.target.value)} className="w-full bg-surface border border-primary text-white text-xs px-2 py-1 rounded outline-none" />
                            <div className="relative">
                              <select value={editEmpDept} onChange={e => setEditEmpDept(e.target.value)} className="w-full bg-surface border border-primary text-white text-xs pl-2 pr-7 py-1 rounded outline-none appearance-none cursor-pointer [color-scheme:dark]">
                                {["ENGINEERING", "MARKETING", "HUMAN RESOURCES", "EXECUTIVE", "DESIGN", "FACILITIES", "FINANCE", "OPERATIONS", "SALES", "PRODUCT", "LEGAL"].map(d => (
                                  <option key={d} value={d} className="bg-background-dark text-white font-sans">{d}</option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-[14px]">expand_more</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={saveEdit} className="flex-1 bg-primary text-black font-bold text-[10px] py-1.5 rounded hover:bg-white transition-colors uppercase">Save</button>
                              <button onClick={cancelEditing} className="flex-1 bg-surface border border-border-dim text-text-muted font-bold text-[10px] py-1.5 rounded hover:text-white transition-colors uppercase">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                <p className="text-white font-bold text-sm tracking-wide">{emp.name}</p>
                              </div>
                              <p className="text-text-muted text-xs font-sans pl-4 border-l border-border-dim ml-1 my-1">{emp.role}</p>
                              <div className="flex gap-2 items-center mt-2 pl-4 ml-1">
                                <span className="text-primary text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">{emp.department}</span>
                                <span className="text-text-muted text-[9px]">{emp.id}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditing(emp)} className="text-text-muted hover:text-primary transition-colors p-1 bg-surface rounded"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                              <button onClick={() => removeEmployee(emp.id)} className="text-text-muted hover:text-critical transition-colors p-1 bg-surface rounded"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Interactive Neural Grid Bulk Import */}
                <section className="glass-panel p-6 border border-border-dim">
                   <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">data_object</span>
                    Neural Grid Bulk Injection
                  </h2>
                  <p className="text-xs text-text-muted mb-3 font-sans">Inject multiple neural patterns via JSON array structure. Required parameters: name, role.</p>
                  <div className="relative">
                    <textarea 
                      value={bulkImportText}
                      onChange={e => setBulkImportText(e.target.value)}
                      placeholder='[&#10;  { "name": "Sarah Connor", "role": "Security Protocal", "department": "ENGINEERING" }&#10;]'
                      className="w-full h-32 bg-surface-dim border border-border-dim text-primary text-xs p-3 rounded-lg focus:border-primary outline-none transition-colors font-mono resize-none leading-relaxed"
                      spellCheck="false"
                    />
                    <button 
                      onClick={handleBulkImport}
                      className="absolute bottom-3 right-3 bg-primary text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-white transition-colors shadow-lg shadow-primary/20"
                    >
                      EXECUTE INJECTION
                    </button>
                  </div>
                </section>

              </motion.div>
            )}

            {activeTab === "INTEGRATIONS" && (
              <motion.div key="integrations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <section className="glass-panel p-6 border border-border-dim">
                  <h2 className="text-primary text-sm font-bold tracking-widest uppercase border-b border-border-dim pb-2 mb-6">Integration Control Panel</h2>
                  <div className="grid gap-4">
                    {integrations.map(int => (
                      <div key={int.id} className="flex items-center justify-between p-4 bg-surface-dim border border-border-dim rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${int.status === 'Offline' ? 'bg-surface text-text-muted' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            <span className="material-symbols-outlined">{int.icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-wide">{int.name}</p>
                            <p className="text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">{int.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold ${int.status === 'Offline' ? 'text-text-muted' : 'text-emerald-400'}`}>{int.status}</span>
                          <button onClick={() => toggleIntegration(int.id)} className={`w-10 h-5 rounded-full relative transition-colors ${int.status === 'Offline' ? 'bg-surface border border-border-dim' : 'bg-primary/30 border border-primary'}`}>
                            <motion.div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full ${int.status === 'Offline' ? 'bg-text-muted left-1' : 'bg-primary right-1'}`} layout />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "DANGER" && (
              <motion.div key="danger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <section className="glass-panel p-6 border border-critical/30 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #ff003c 25%, transparent 25%, transparent 75%, #ff003c 75%, #ff003c), repeating-linear-gradient(45deg, #ff003c 25%, transparent 25%, transparent 75%, #ff003c 75%, #ff003c)", backgroundPosition: "0 0, 10px 10px", backgroundSize: "20px 20px" }}></div>
                  <h2 className="text-critical text-sm font-bold tracking-widest uppercase border-b border-critical/30 pb-2 mb-6 flex items-center gap-2 relative z-10">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Substation Danger Zone
                  </h2>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between p-4 bg-surface/80 border border-critical/20 rounded-lg backdrop-blur-sm">
                      <div>
                        <p className="font-bold text-white text-sm">Purge Neural Cache</p>
                        <p className="text-xs text-text-muted mt-1 font-sans">Wipes all temporary structural memory vectors. Cannot be undone.</p>
                      </div>
                      <button onClick={purgeCache} disabled={isPurging} className="px-4 py-2 border border-critical text-critical text-xs font-bold rounded hover:bg-critical hover:text-black transition-colors uppercase tracking-wider disabled:opacity-50">
                        {isPurging ? "PURGING..." : "Purge Cache"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface/80 border border-critical/20 rounded-lg backdrop-blur-sm">
                      <div>
                        <p className="font-bold text-white text-sm">Initiate Protocol Zero</p>
                        <p className="text-xs text-text-muted mt-1 font-sans">Formats the entire grid. All patterns will be permanently erased.</p>
                      </div>
                      <button onClick={() => setShowFactoryResetConf(true)} className="px-4 py-2 bg-critical text-black text-xs font-bold rounded hover:bg-red-500 transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.3)]">Factory Reset</button>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Interactive System Audit Log Sidebar */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 glass-panel border border-border-dim rounded-xl overflow-hidden self-start sticky top-6 max-h-[calc(100vh-120px)]">
          <div className="bg-surface border-b border-border-dim p-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest uppercase text-text-muted flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">terminal</span>
              System Audit Log
            </h3>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px]">
            <AnimatePresence>
              {auditLogs.map((log, i) => (
                <motion.div 
                  key={`${log.time}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 items-start"
                >
                  <span className="text-primary whitespace-nowrap opacity-70">[{log.time}]</span>
                  <span className="text-text-muted leading-tight">{log.action}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {auditLogs.length === 0 && (
              <div className="text-text-muted/50 text-center italic py-4">No recent activity detected.</div>
            )}
          </div>
        </div>

      </main>

      <AnimatePresence>
        {/* Delete Status Modal */}
        {statusToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-critical p-6 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(255,0,0,0.15)] mx-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-critical"></div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-critical">warning</span>
                Confirm Deletion
              </h3>
              <p className="text-text-muted text-sm mb-6 font-sans">Are you sure you want to delete the status protocol "{statusToDelete}"?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setStatusToDelete(null)} className="px-4 py-2 text-xs uppercase font-bold text-text-muted hover:text-white transition-colors border border-transparent hover:border-border-dim rounded">Cancel</button>
                <button onClick={confirmRemoveStatus} className="px-4 py-2 text-xs uppercase font-bold bg-critical text-black rounded hover:bg-critical/90 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.3)]">Proceed</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Employee Modal */}
        {empToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-critical p-6 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(255,0,0,0.15)] mx-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-critical"></div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-critical">admin_panel_settings</span>
                Terminate Identity
              </h3>
              <p className="text-text-muted text-sm mb-6 font-sans">Are you sure you want to permanently erase this HRIS neural pattern?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEmpToDelete(null)} className="px-4 py-2 text-xs uppercase font-bold text-text-muted hover:text-white transition-colors border border-transparent hover:border-border-dim rounded">Cancel</button>
                <button onClick={confirmRemoveEmployee} className="px-4 py-2 text-xs uppercase font-bold bg-critical text-black rounded hover:bg-critical/90 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.3)]">Terminate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showFactoryResetConf && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-critical p-6 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(255,0,0,0.15)] mx-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-critical"></div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-critical">warning</span>
                Absolute Erasure
              </h3>
              <p className="text-text-muted text-sm mb-6 font-sans">Are you absolutely sure you want to format the grid? This action is irreversible and resets all data.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowFactoryResetConf(false)} className="px-4 py-2 text-xs uppercase font-bold text-text-muted hover:text-white transition-colors border border-transparent hover:border-border-dim rounded">Cancel</button>
                <button onClick={factoryReset} className="px-4 py-2 text-xs uppercase font-bold bg-critical text-black rounded hover:bg-critical/90 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.3)]">Execute</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
