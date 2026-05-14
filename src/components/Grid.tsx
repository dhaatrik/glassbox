import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Ticket = {
  id: string;
  dept: string;
  category?: string;
  title: string;
  status: string;
  time: string;
  description: string;
  dueDate?: string;
  lastUpdatedBy?: string;
  isFavorite?: boolean;
  attachments?: { name: string; type: string }[];
  history?: { date: string; action: string; user: string }[];
  reactions?: Record<string, number>;
  dependencies?: string[];
};

const initialTickets: Ticket[] = [
  {
    id: "#TKT-9942",
    dept: "[MKT]",
    category: "Culture",
    title: "Campaign budget approval stuck in finance review for Q4 launch.",
    status: "QUEUED",
    time: "T+02 DAYS",
    description:
      "The Q4 marketing campaign budget has been pending approval in the finance queue for over 48 hours. This delay is impacting vendor commitments and media buys. Requesting immediate review to avoid missing launch window.",
    dueDate: "2026-04-10",
    lastUpdatedBy: "J. Belfort",
    isFavorite: false,
    dependencies: [],
  },
  {
    id: "#TKT-9945",
    dept: "[ENG]",
    category: "Tools",
    title: "CI/CD pipeline latency increasing during peak hours.",
    status: "QUEUED",
    time: "T+05 DAYS",
    description:
      "Build times have increased by 40% during the 1PM-4PM window. Suspect runner starvation or caching issues. Needs investigation by DevEx team.",
    dueDate: "2026-04-08",
    lastUpdatedBy: "A. Lovelace",
    isFavorite: true,
    dependencies: ["#TKT-9820"],
  },
  {
    id: "#TKT-9981",
    dept: "[HR]",
    title: "Update remote work policy documentation on internal wiki.",
    status: "QUEUED",
    time: "T+01 DAYS",
    description: "Update remote work policy documentation on internal wiki.",
    dueDate: "2026-04-15",
    lastUpdatedBy: "T. Flenderson",
    isFavorite: false,
  },
  {
    id: "#TKT-9820",
    dept: "[OPS]",
    title: "Server migration protocol review in progress.",
    status: "PROCESSING",
    time: "RUNNING...",
    description: "Server migration protocol review in progress.",
    dueDate: "2026-04-06",
    lastUpdatedBy: "System",
    isFavorite: false,
  },
  {
    id: "#TKT-9899",
    dept: "[DES]",
    title: "Design system token alignment for mobile views.",
    status: "PROCESSING",
    time: "T+12 DAYS",
    description: "Design system token alignment for mobile views.",
    dueDate: "2026-04-20",
    lastUpdatedBy: "S. Jobs",
    isFavorite: false,
  },
  {
    id: "#TKT-4921",
    dept: "[EXEC]",
    title: "Quarterly bonus structure transparency request.",
    status: "STALLED",
    time: "42 DAYS",
    description: "Quarterly bonus structure transparency request.",
    dueDate: "2026-03-01",
    lastUpdatedBy: "System",
    isFavorite: true,
  },
  {
    id: "#TKT-5502",
    dept: "[FAC]",
    title: "Elevator B maintenance request pending approval.",
    status: "STALLED",
    time: "31 DAYS",
    description: "Elevator B maintenance request pending approval.",
    dueDate: "2026-03-15",
    lastUpdatedBy: "System",
    isFavorite: false,
  },
  {
    id: "#TKT-9100",
    dept: "[FIN]",
    title: "Q3 Expense report template update.",
    status: "RESOLVED",
    time: "DONE",
    description: "Q3 Expense report template update.",
    dueDate: "2026-02-28",
    lastUpdatedBy: "System",
    isFavorite: false,
  },
];

const COLUMNS = ["QUEUED", "PROCESSING", "STALLED", "RESOLVED"];

export function Grid({
  initialFilter,
  onClearFilter,
}: {
  initialFilter?: { dept?: string; status?: string; category?: string } | null;
  onClearFilter?: () => void;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [originalTicket, setOriginalTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "title" | "dept">("time");
  const [showFilters, setShowFilters] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [hoveredTicketId, setHoveredTicketId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, ticketId: string } | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const fetchTickets = () => {
      const stored = localStorage.getItem("glassbox_tickets");
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        setTickets(initialTickets);
      }
      setIsLoading(false);
    };
    
    // Simulate slight network delay for the skeleton loading effect
    setTimeout(fetchTickets, 600);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("glassbox_tickets", JSON.stringify(tickets));
    }
  }, [tickets, isLoading]);

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.dept) setFilterDept(initialFilter.dept);
      if (initialFilter.status) setFilterStatus(initialFilter.status);
      if (initialFilter.category) setFilterCategory(initialFilter.category);
      setShowFilters(true);
      if (onClearFilter) onClearFilter();
    }
  }, [initialFilter, onClearFilter]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const newTickets = [...tickets];
      const ticketIndex = newTickets.findIndex(
        (t) => t.id === result.draggableId,
      );

      if (ticketIndex > -1) {
        const movedTicket = newTickets[ticketIndex];

        // Ensure dependencies are met if moving to RESOLVED
        if (destination.droppableId === "RESOLVED" && movedTicket.dependencies && movedTicket.dependencies.length > 0) {
          const unresolvedDeps = movedTicket.dependencies.filter(depId => {
            const depTicket = tickets.find(t => t.id === depId);
            return depTicket && depTicket.status !== "RESOLVED";
          });
          if (unresolvedDeps.length > 0) {
            alert(`Cannot resolve ticket. Waiting on dependencies: ${unresolvedDeps.join(", ")}`);
            return;
          }
        }

        newTickets[ticketIndex].status = destination.droppableId;
        setTickets(newTickets);
      }
    }
  };

  const handleCreateTicket = () => {
    const newTicket: Ticket = {
      id: `#TKT-${Math.floor(Math.random() * 10000)}`,
      dept: "[NEW]",
      title: "",
      status: "QUEUED",
      time: "T+00 DAYS",
      description: "",
      dueDate: new Date().toISOString().split('T')[0],
      lastUpdatedBy: "Current User",
      isFavorite: false,
    };
    setSelectedTicket(newTicket);
    setOriginalTicket(newTicket);
    setIsCreating(true);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOriginalTicket(ticket);
    setIsCreating(false);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    if (!updatedTicket.title.trim() && !updatedTicket.description.trim() && !isCreating) {
      // If inline editing just title, allow it
      if (updatedTicket.title.trim()) {
         // This is fine
      } else {
         return;
      }
    }
    
    if (isCreating) {
      setTickets([updatedTicket, ...tickets]);
      setIsCreating(false);
    } else {
      if (originalTicket) {
        const changes: string[] = [];
        if (originalTicket.status !== updatedTicket.status) changes.push(`Status changed from ${originalTicket.status} to ${updatedTicket.status}`);
        if (originalTicket.title !== updatedTicket.title) changes.push(`Title updated`);
        if (originalTicket.description !== updatedTicket.description) changes.push(`Description updated`);
        if (originalTicket.dept !== updatedTicket.dept) changes.push(`Department changed from ${originalTicket.dept} to ${updatedTicket.dept}`);
        if (originalTicket.time !== updatedTicket.time) changes.push(`Time changed from ${originalTicket.time} to ${updatedTicket.time}`);
        if (originalTicket.dueDate !== updatedTicket.dueDate) changes.push(`Due date changed from ${originalTicket.dueDate} to ${updatedTicket.dueDate}`);

        if (changes.length > 0) {
          const newHistoryEntry = {
            date: new Date().toISOString(),
            action: changes.join(", "),
            user: "Current User"
          };
          updatedTicket.history = [...(updatedTicket.history || []), newHistoryEntry];
        }
      }

      setTickets(
        tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
      );
    }
    setSelectedTicket(null);
    setOriginalTicket(null);
  };

  const handleDeleteTicket = (id: string) => {
    setTickets(tickets.filter((t) => t.id !== id));
    setSelectedTicket(null);
    setOriginalTicket(null);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setOriginalTicket(null);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTickets(tickets.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept ? t.dept === filterDept : true;
      const matchesStatus = filterStatus ? t.status === filterStatus : true;
      const matchesCategory = filterCategory ? t.category === filterCategory : true;
      const matchesFavorite = filterFavorite ? t.isFavorite : true;
      return matchesSearch && matchesDept && matchesStatus && matchesCategory && matchesFavorite;
    });

    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "dept") return a.dept.localeCompare(b.dept);
      return a.time.localeCompare(b.time);
    });

    return result;
  }, [tickets, searchQuery, filterDept, filterStatus, filterCategory, filterFavorite, sortBy]);

  const getTicketsByStatus = (status: string) =>
    filteredTickets.filter((t) => t.status === status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      <header className="flex flex-col px-4 py-3 border-b border-border-dim bg-background-dark/80 backdrop-blur-xl z-40 relative flex-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h1 className="text-white text-lg font-bold tracking-[0.1em] uppercase font-display">
              Global Grid // Monitor
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'k', 'metaKey': true }))}
              className="hidden md:flex items-center gap-2 border border-border-dim bg-surface/30 hover:bg-surface-dim hover:text-primary transition-colors px-3 py-1.5 rounded-full text-xs text-text-muted mr-2"
            >
              <span className="material-symbols-outlined text-[14px]">search</span>
              Shortcut ⌘K
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID or Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-dim/50 backdrop-blur-md border border-border-dim text-white text-xs px-3 py-1.5 rounded-full focus:border-primary outline-none w-32 md:w-48 transition-colors"
              />
            </div>
            <button
              onClick={() => setFilterFavorite(!filterFavorite)}
              className={`flex items-center justify-center w-8 h-8 border border-border-dim bg-surface-dim/50 backdrop-blur-md transition-colors rounded-full ${filterFavorite ? "text-yellow-500 border-yellow-500" : "text-text-muted hover:text-yellow-500"}`}
              title="Filter Favorites"
            >
              <span className="material-symbols-outlined text-[18px]">
                {filterFavorite ? "star" : "star_border"}
              </span>
            </button>
            <div className="w-px h-6 bg-border-dim mx-1"></div>
            <button
              onClick={() => window.location.reload()}
              className="text-text-muted hover:text-critical transition-colors ml-1 p-1.5 rounded-full hover:bg-surface-dim"
              title="Disconnect"
            >
              <span className="material-symbols-outlined text-lg">
                power_settings_new
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && !isLoading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border-dim overflow-visible"
            >
              <div className="relative group z-50">
                <button className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full outline-none flex items-center gap-2 hover:border-primary transition-colors shadow-lg">
                  {filterDept || "All Departments"}
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-background-dark border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden backdrop-blur-2xl z-50">
                  <button 
                    onClick={() => setFilterDept("")}
                    className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${!filterDept ? 'text-primary bg-primary/10' : 'text-white'}`}
                  >
                    All Departments
                  </button>
                  {Array.from(new Set(tickets.map((t) => t.dept))).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setFilterDept(dept)}
                      className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${filterDept === dept ? 'text-primary bg-primary/10' : 'text-white'}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group z-50">
                <button className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full outline-none flex items-center gap-2 hover:border-primary transition-colors shadow-lg">
                  {filterCategory || "All Categories"}
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-background-dark border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden backdrop-blur-2xl z-50">
                  <button 
                    onClick={() => setFilterCategory("")}
                    className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${!filterCategory ? 'text-primary bg-primary/10' : 'text-white'}`}
                  >
                    All Categories
                  </button>
                  {Array.from(new Set(tickets.filter(t => t.category).map((t) => t.category as string))).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${filterCategory === cat ? 'text-primary bg-primary/10' : 'text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group z-50">
                <button className="bg-background-dark/80 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full outline-none flex items-center gap-2 hover:border-primary transition-colors shadow-lg">
                  {filterStatus || "All Statuses"}
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-background-dark border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden backdrop-blur-2xl z-50">
                  <button 
                    onClick={() => setFilterStatus("")}
                    className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${!filterStatus ? 'text-primary bg-primary/10' : 'text-white'}`}
                  >
                    All Statuses
                  </button>
                  {COLUMNS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setFilterStatus(col)}
                      className={`text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${filterStatus === col ? 'text-primary bg-primary/10' : 'text-white'}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden z-30 relative scroll-smooth">
        {isLoading ? (
          <div className="flex h-full min-w-full w-max p-4 gap-4 snap-x snap-mandatory">
            {COLUMNS.map((colId) => (
              <div key={`skeleton-${colId}`} className="flex flex-col w-[85vw] md:w-auto md:flex-1 md:min-w-[300px] h-full rounded-2xl border border-white/10 bg-white/5 p-4 gap-4 opacity-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                <div className="h-6 w-32 bg-surface-dim rounded mb-4"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col p-4 bg-surface-dim/50 rounded-2xl gap-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-surface-dim rounded"></div>
                      <div className="h-4 w-12 bg-surface-dim rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-surface-dim rounded"></div>
                    <div className="h-8 w-full bg-surface-dim rounded"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full min-w-full w-max p-4 gap-6 snap-x snap-mandatory">
              {COLUMNS.map((colId) => {
                const columnTickets = getTicketsByStatus(colId);
                return (
                  <div
                    key={colId}
                    className={`flex flex-col w-[85vw] md:w-auto md:flex-1 md:min-w-[300px] h-full rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.37)] snap-center ${colId === "STALLED" ? "border-critical/30 bg-critical/5 shadow-[0_0_30px_rgba(255,0,51,0.05)]" : "border-white/10 bg-white/5 backdrop-blur-3xl"}`}
                  >
                    <div
                      className={`flex items-center justify-between p-4 border-b bg-surface-dim/30 backdrop-blur-md sticky top-0 z-10 shadow-sm ${colId === "STALLED" ? "border-critical/30" : "border-white/10"}`}
                    >
                      <h2
                        className={`text-sm font-sans font-bold tracking-widest uppercase flex items-center gap-2 ${colId === "PROCESSING" ? "text-primary" : colId === "STALLED" ? "text-critical" : colId === "RESOLVED" ? "text-stable" : "text-text-muted"}`}
                      >
                        {colId === "STALLED" && (
                          <span className="material-symbols-outlined text-[16px] animate-pulse">
                            warning
                          </span>
                        )}
                        {colId}
                      </h2>
                      <span
                        className={`font-display text-xl ${colId === "PROCESSING" ? "text-white" : colId === "STALLED" ? "text-critical" : colId === "RESOLVED" ? "text-stable" : "text-primary"}`}
                      >
                        {columnTickets.length.toString().padStart(2, "0")}
                      </span>
                    </div>

                    {colId === "QUEUED" && (
                      <button
                        onClick={handleCreateTicket}
                        className="m-3 py-2 border border-dashed border-border-dim rounded-xl text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 text-xs font-sans font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>
                        NEW TICKET
                      </button>
                    )}

                    <Droppable droppableId={colId}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px] transition-colors rounded-xl relative ${snapshot.isDraggingOver ? "bg-white/10 border border-dashed border-primary/50" : ""}`}
                        >
                          {columnTickets.length === 0 && !snapshot.isDraggingOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted/50 p-6 text-center select-none pointer-events-none">
                               <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
                                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                                    {colId === "QUEUED" ? "line_style" : colId === "PROCESSING" ? "memory" : colId === "STALLED" ? "shield_locked" : "task_alt"}
                                  </span>
                                  <p className="text-xs font-sans font-medium">No {colId.toLowerCase()} tickets</p>
                                  {(colId === "STALLED" || colId === "QUEUED") && <p className="text-[10px] mt-1 text-primary/70">Inbox Zero achieved! 🎉</p>}
                               </motion.div>
                            </div>
                          )}
                          {columnTickets.map((ticket, index) => {
                            const isDimmed = hoveredTicketId && hoveredTicketId !== ticket.id && !ticket.dependencies?.includes(hoveredTicketId) && !(tickets.find(t => t.id === hoveredTicketId)?.dependencies?.includes(ticket.id));
                            const isHighlighted = hoveredTicketId === ticket.id || ticket.dependencies?.includes(hoveredTicketId!) || tickets.find(t => t.id === hoveredTicketId!)?.dependencies?.includes(ticket.id);
                            
                            const getDaysLeft = (date?: string) => {
                              if (!date) return null;
                              return Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            };
                            const daysLeft = getDaysLeft(ticket.dueDate);
                            const isUrgent = daysLeft !== null && daysLeft <= 2 && ticket.status !== "RESOLVED";

                            return (
                            <Draggable
                              key={ticket.id}
                              draggableId={ticket.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...(provided.draggableProps as any)}
                                  {...(provided.dragHandleProps as any)}
                                  onClick={() => handleSelectTicket(ticket)}
                                  onMouseEnter={() => setHoveredTicketId(ticket.id)}
                                  onMouseLeave={() => setHoveredTicketId(null)}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({ x: e.clientX, y: e.clientY, ticketId: ticket.id });
                                  }}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} scale(1.05) rotate(2deg)`
                                      : provided.draggableProps.style?.transform,
                                  }}
                                  className={`group relative flex flex-col ${isCompact ? 'p-3' : 'p-4'} bg-surface-dim/90 backdrop-blur-2xl transition-all duration-300 rounded-2xl cursor-pointer ${
                                    snapshot.isDragging
                                      ? "shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 border-primary"
                                      : ""
                                  } ${
                                    ticket.status === "PROCESSING"
                                      ? "border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:border-primary/60"
                                      : ticket.status === "STALLED"
                                        ? "border-critical/50 hover:border-critical"
                                        : ticket.status === "RESOLVED"
                                          ? "border-border-dim/50 opacity-75 hover:opacity-100"
                                          : "border-border-dim hover:border-primary/40"
                                  } ${isDimmed ? "opacity-30 grayscale saturate-0 pointer-events-none" : isHighlighted && !isDimmed ? "shadow-[0_0_20px_rgba(0,240,255,0.2)] border-primary z-10" : ""}`}
                                >
                                  {isUrgent && (
                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-critical/50 to-orange-500/50 opacity-50 blur-sm -z-10 animate-pulse"></div>
                                  )}
                                  {ticket.status === "PROCESSING" && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-bl-lg rounded-tr-xl"></div>
                                  )}
                                  <div
                                    className={`flex justify-between items-start mb-3 ${ticket.status === "RESOLVED" ? "opacity-60" : ""}`}
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                          ticket.status === "PROCESSING"
                                            ? "text-black bg-primary font-bold"
                                            : ticket.status === "STALLED"
                                              ? "text-black bg-critical font-bold"
                                              : ticket.status === "RESOLVED"
                                                ? "text-gray-400 bg-surface"
                                                : "text-primary bg-primary/10"
                                        }`}
                                      >
                                        {ticket.id}
                                      </span>
                                      <span
                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface border border-border-dim ${
                                          ticket.status === "PROCESSING"
                                            ? "text-primary"
                                            : ticket.status === "STALLED"
                                              ? "text-critical"
                                              : ticket.status === "RESOLVED"
                                                ? "text-gray-500"
                                                : "text-text-muted"
                                        }`}
                                      >
                                        {ticket.dept}
                                      </span>
                                      {!isCompact && ticket.category && (
                                        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-surface border border-border-dim text-white/70">
                                          {ticket.category}
                                        </span>
                                      )}
                                    </div>
                                    {/* Vibe Check Emoji & Favorite */}
                                    <div className="flex items-center gap-2 flex-shrink-0 relative">
                                      {/* Avatar */}
                                      <div className="flex -space-x-2 mr-1" title={ticket.lastUpdatedBy}>
                                        <div className="w-5 h-5 rounded-full border border-background-dark bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-[8px] font-bold text-black shadow-lg z-10 transition-transform group-hover:-translate-y-1">
                                          {ticket.lastUpdatedBy?.substring(0, 2).toUpperCase() || "SU"}
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => toggleFavorite(e, ticket.id)}
                                        className={`transition-colors ${ticket.isFavorite ? 'text-yellow-500' : 'text-text-muted hover:text-yellow-500'}`}
                                      >
                                        <span className="material-symbols-outlined text-[16px]">
                                          {ticket.isFavorite ? 'star' : 'star_border'}
                                        </span>
                                      </button>
                                      <span className="text-sm" title="Vibe Check">
                                        {ticket.status === "STALLED"
                                          ? "😡"
                                          : ticket.status === "PROCESSING"
                                            ? "🏃"
                                            : ticket.status === "RESOLVED"
                                              ? "🥳"
                                              : "😐"}
                                      </span>
                                    </div>
                                  </div>
                                  {editingTitleId === ticket.id ? (
                                    <input
                                      autoFocus
                                      value={editingTitleValue}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => setEditingTitleValue(e.target.value)}
                                      onBlur={() => {
                                        if (editingTitleValue.trim() !== ticket.title) {
                                          handleUpdateTicket({ ...ticket, title: editingTitleValue.trim() || ticket.title });
                                        }
                                        setEditingTitleId(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          if (editingTitleValue.trim() !== ticket.title) {
                                            handleUpdateTicket({ ...ticket, title: editingTitleValue.trim() || ticket.title });
                                          }
                                          setEditingTitleId(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingTitleId(null);
                                        }
                                      }}
                                      className="text-sm font-sans font-medium mb-3 bg-surface border border-primary px-2 py-1 rounded w-full outline-none text-white shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                                    />
                                  ) : (
                                    <p
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTitleId(ticket.id);
                                        setEditingTitleValue(ticket.title);
                                      }}
                                      className={`text-sm font-sans font-medium leading-snug mb-3 line-clamp-2 ${
                                        ticket.status === "PROCESSING" ||
                                        ticket.status === "STALLED"
                                          ? "text-white"
                                          : ticket.status === "RESOLVED"
                                            ? "text-gray-400"
                                            : "text-gray-200"
                                      }`}
                                    >
                                      {ticket.title}
                                    </p>
                                  )}

                                  {/* AI TL;DR Summary */}
                                  {!isCompact && ticket.status !== "RESOLVED" && (
                                    <div className="mb-3 p-2 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-1.5 backdrop-blur-md">
                                      <div className="flex items-start gap-2">
                                        <span className="text-xs">✨</span>
                                        <p className="text-[10px] font-sans text-text-muted leading-tight line-clamp-2">
                                          {ticket.status === "STALLED"
                                            ? "Blocked by external dependency. Needs escalation."
                                            : ticket.status === "PROCESSING"
                                              ? "Active investigation. Logs show anomaly in region us-east."
                                              : "Awaiting initial triage and assignment."}
                                        </p>
                                      </div>
                                      {ticket.dependencies && ticket.dependencies.length > 0 && (
                                        <div className="pt-2 border-t border-border-dim/30 flex items-center gap-1.5 flex-wrap mt-1">
                                          <span className="text-[9px] font-sans text-text-muted uppercase font-bold tracking-widest">DEPS:</span>
                                          {ticket.dependencies.map(dep => {
                                            const depTicket = tickets.find(t => t.id === dep);
                                            const isResolved = depTicket?.status === "RESOLVED";
                                            return (
                                              <span key={dep} className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${isResolved ? "border-stable/30 text-stable bg-stable/10" : "border-critical/30 text-critical bg-critical/10"}`}>
                                                {dep}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div
                                    className={`flex items-center justify-between border-t border-white/10 pt-3 mt-auto relative`}
                                  >
                                    {/* Smart Progress Bar */}
                                    {daysLeft !== null && ticket.status !== "RESOLVED" && (
                                      <div className="absolute top-0 left-0 -mt-[1px] w-full h-[1px] bg-white/5">
                                        <div 
                                          className={`h-full ${daysLeft <= 1 ? "bg-critical shadow-[0_0_5px_red]" : daysLeft <= 3 ? "bg-orange-400" : "bg-primary"}`} 
                                          style={{ width: `${Math.max(0, Math.min(100, 100 - (daysLeft * 10)))}%`}}
                                        ></div>
                                      </div>
                                    )}
                                    <span
                                      className={`text-[10px] font-sans font-bold flex items-center gap-1.5 ${
                                        ticket.status === "PROCESSING"
                                          ? "text-primary"
                                          : ticket.status === "STALLED"
                                            ? "text-critical"
                                            : ticket.status === "RESOLVED"
                                              ? "text-stable"
                                              : "text-text-muted"
                                      }`}
                                    >
                                      {ticket.status === "STALLED" && (
                                        <span className="material-symbols-outlined text-[14px]">
                                          timer
                                        </span>
                                      )}
                                      {ticket.status === "RESOLVED" && (
                                        <span className="material-symbols-outlined text-[14px]">
                                          check_circle
                                        </span>
                                      )}
                                      {ticket.status === "QUEUED" && (
                                        <span className="material-symbols-outlined text-[14px]">
                                          schedule
                                        </span>
                                      )}
                                      {ticket.time}
                                    </span>

                                    {ticket.status === "PROCESSING" && (
                                      <div className="flex items-center gap-1 text-primary">
                                        <span className="material-symbols-outlined text-[16px] animate-spin">
                                          sync
                                        </span>
                                      </div>
                                    )}
                                    {ticket.status === "STALLED" && (
                                      <button
                                        className="flex items-center gap-1 bg-critical/10 hover:bg-critical/20 px-2.5 py-1 rounded-full border border-critical/30 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="material-symbols-outlined text-[14px] text-critical">
                                          bolt
                                        </span>
                                        <span className="text-[10px] font-sans text-critical font-bold tracking-wider">
                                          BOOST
                                        </span>
                                      </button>
                                    )}
                                    {(ticket.status === "QUEUED" ||
                                      ticket.status === "PROCESSING") && (
                                      <div className="flex items-center gap-1 text-text-muted group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">
                                          arrow_upward
                                        </span>
                                        <span className="text-[10px] font-sans font-bold tracking-wider">
                                          NUDGE
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                           );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[999] w-48 bg-surface border border-white/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl flex flex-col pointer-events-auto"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-white/10 text-[10px] font-mono text-text-muted">ACTIONS</div>
            {COLUMNS.map(col => (
              <button
                key={col}
                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                onClick={() => {
                  const tToUpdate = tickets.find(t => t.id === contextMenu.ticketId);
                  if (tToUpdate) {
                    handleUpdateTicket({...tToUpdate, status: col});
                  }
                  setContextMenu(null);
                }}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {col === "QUEUED" ? "line_style" : col === "PROCESSING" ? "memory" : col === "STALLED" ? "shield_locked" : "task_alt"}
                </span>
                Move to {col}
              </button>
            ))}
            <div className="w-full h-px bg-white/10"></div>
            <button
              className="w-full text-left px-4 py-2.5 text-xs text-critical hover:bg-critical/10 transition-colors flex items-center gap-2"
              onClick={() => {
                 handleDeleteTicket(contextMenu.ticketId);
                 setContextMenu(null);
              }}
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel bento-card w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-dim bg-surface-dim/50 shrink-0">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={selectedTicket.id}
                    onChange={(e) =>
                      setSelectedTicket({
                        ...selectedTicket,
                        id: e.target.value,
                      })
                    }
                    className={`text-xs font-mono px-3 py-1 rounded-full font-bold outline-none border border-transparent hover:border-primary focus:border-primary transition-colors ${
                      selectedTicket.status === "QUEUED"
                        ? "bg-primary/10 text-primary"
                        : selectedTicket.status === "PROCESSING"
                          ? "bg-primary text-black"
                          : selectedTicket.status === "STALLED"
                            ? "bg-critical/20 text-critical"
                            : "bg-stable/20 text-stable"
                    }`}
                  />
                  <input
                    type="text"
                    value={selectedTicket.dept}
                    onChange={(e) =>
                      setSelectedTicket({
                        ...selectedTicket,
                        dept: e.target.value,
                      })
                    }
                    className="text-xs font-mono font-bold text-text-muted bg-surface border border-border-dim px-2 py-1 rounded-md hover:border-primary focus:border-primary outline-none w-20 transition-colors"
                  />
                  {originalTicket &&
                    JSON.stringify(selectedTicket) !==
                      JSON.stringify(originalTicket) && (
                      <span className="text-[10px] text-yellow-500 font-sans font-bold animate-pulse flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          edit_note
                        </span>
                        UNSAVED
                      </span>
                    )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-text-muted hover:text-white bg-surface hover:bg-surface-dim p-2 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center text-xs font-sans font-bold text-text-muted border-b border-border-dim pb-4">
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-wider">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          status: e.target.value,
                        })
                      }
                      className="bg-surface border border-border-dim text-white outline-none px-3 py-1.5 rounded-lg focus:border-primary transition-colors [color-scheme:dark]"
                    >
                      {COLUMNS.map((col) => (
                        <option
                          key={col}
                          value={col}
                          className="bg-background-dark text-white"
                        >
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>
                    Time in state:{" "}
                    <input
                      type="text"
                      value={selectedTicket.time}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          time: e.target.value,
                        })
                      }
                      className="text-white bg-surface px-2 py-1 rounded-md border border-border-dim hover:border-primary focus:border-primary outline-none transition-colors w-24"
                    />
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-sans font-bold text-text-muted border-b border-border-dim pb-4">
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-wider">Due Date:</span>
                    <input
                      type="date"
                      value={selectedTicket.dueDate || ""}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          dueDate: e.target.value,
                        })
                      }
                      className="bg-surface border border-border-dim text-white outline-none px-3 py-1.5 rounded-lg focus:border-primary transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-wider">Category:</span>
                    <select
                      value={selectedTicket.category || ""}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          category: e.target.value,
                        })
                      }
                      className="bg-surface border border-border-dim text-white outline-none px-3 py-1.5 rounded-lg focus:border-primary transition-colors [color-scheme:dark]"
                    >
                      <option value="" className="bg-background-dark text-white">None</option>
                      <option value="Culture" className="bg-background-dark text-white">Culture</option>
                      <option value="Workload" className="bg-background-dark text-white">Workload</option>
                      <option value="Management" className="bg-background-dark text-white">Management</option>
                      <option value="Tools" className="bg-background-dark text-white">Tools</option>
                      <option value="Other" className="bg-background-dark text-white">Other</option>
                    </select>
                  </div>
                  <span className="flex items-center gap-2 uppercase tracking-wider hidden sm:flex">
                    <span className="material-symbols-outlined text-[16px]">
                      person
                    </span>
                    Last Updated By:{" "}
                    <span className="text-white bg-surface px-2 py-1 rounded-md">
                      {selectedTicket.lastUpdatedBy || "Unknown"}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedTicket.title}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          title: e.target.value,
                        })
                      }
                      className="text-2xl font-bold text-white font-display tracking-wide bg-surface/50 border border-border-dim focus:border-primary outline-none w-full p-3 rounded-xl transition-colors"
                      placeholder="Ticket Title"
                    />
                  </div>

                  {/* Dependencies Editor */}
                  <div>
                    <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                      Dependencies (Blocked by)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTicket.dependencies && selectedTicket.dependencies.length > 0 ? (
                        selectedTicket.dependencies.map(depId => {
                          const depTicket = tickets.find(t => t.id === depId);
                          const isResolved = depTicket?.status === "RESOLVED";
                          return (
                            <div key={depId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-surface ${isResolved ? 'border-stable/30 text-stable' : 'border-critical/30 text-critical'}`}>
                              <span className="text-xs font-mono font-bold">{depId}</span>
                              <span className="text-xs truncate max-w-[150px]">{depTicket?.title || "Unknown Ticket"}</span>
                              <button 
                                onClick={() => setSelectedTicket({
                                  ...selectedTicket,
                                  dependencies: selectedTicket.dependencies?.filter(id => id !== depId)
                                })}
                                className="text-text-muted hover:text-white"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-text-muted italic">No dependencies</span>
                      )}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedTicket({
                            ...selectedTicket,
                            dependencies: [...(selectedTicket.dependencies || []), e.target.value]
                          });
                        }
                      }}
                      className="bg-surface border border-border-dim text-white outline-none px-3 py-1.5 rounded-lg focus:border-primary transition-colors [color-scheme:dark] text-xs max-w-sm w-full"
                    >
                      <option value="" className="bg-background-dark text-white">+ Add Dependency...</option>
                      {tickets
                        .filter(t => t.id !== selectedTicket.id && !selectedTicket.dependencies?.includes(t.id))
                        .map(t => (
                          <option key={t.id} value={t.id} className="bg-background-dark text-white">
                            {t.id} - {t.title.substring(0, 30)}... ({t.status})
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* AI Summary Section in Modal */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
                    <span className="text-xl">✨</span>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-primary uppercase tracking-wider mb-1">
                        AI TL;DR
                      </h4>
                      <p className="text-sm font-sans text-gray-300 leading-relaxed">
                        {selectedTicket.status === "STALLED"
                          ? "This ticket is blocked by an external dependency. It requires immediate escalation to unblock the pipeline."
                          : selectedTicket.status === "PROCESSING"
                            ? "Active investigation is ongoing. System logs indicate an anomaly in the us-east region that correlates with this issue."
                            : "This ticket is awaiting initial triage and assignment. No critical blockers identified yet."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                      Description
                    </label>
                    <textarea
                      value={selectedTicket.description}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          description: e.target.value,
                        })
                      }
                      className="text-sm font-sans text-gray-300 leading-relaxed bg-surface/50 border border-border-dim focus:border-primary outline-none w-full min-h-[150px] p-4 rounded-xl resize-y transition-colors"
                      placeholder="Ticket Description"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                      Attachments
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      <label htmlFor={`file-upload-${selectedTicket.id}`} className="flex flex-col items-center justify-center w-20 h-20 bg-surface/50 border border-border-dim border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors text-text-muted hover:text-primary">
                        <span className="material-symbols-outlined text-2xl mb-1">add_photo_alternate</span>
                        <span className="text-[10px] font-sans font-bold">Add</span>
                        <input 
                          type="file" 
                          id={`file-upload-${selectedTicket.id}`} 
                          className="hidden" 
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const newAttachments = Array.from(e.target.files).map(file => ({
                                name: file.name,
                                type: file.type || 'unknown'
                              }));
                              setSelectedTicket({
                                ...selectedTicket,
                                attachments: [...(selectedTicket.attachments || []), ...newAttachments]
                              });
                            }
                          }}
                        />
                      </label>
                      {selectedTicket.attachments?.map((attachment, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center w-20 h-20 bg-surface/50 border border-border-dim rounded-xl cursor-pointer hover:border-primary transition-colors text-text-muted hover:text-primary relative group">
                          <span className="material-symbols-outlined text-2xl mb-1">
                            {attachment.type.startsWith('image/') ? 'image' : 'description'}
                          </span>
                          <span className="text-[10px] font-sans font-bold truncate w-16 text-center" title={attachment.name}>{attachment.name}</span>
                          <div 
                            className="absolute -top-2 -right-2 bg-surface border border-border-dim rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-critical/20 hover:border-critical"
                            onClick={() => {
                              setSelectedTicket({
                                ...selectedTicket,
                                attachments: selectedTicket.attachments?.filter((_, i) => i !== idx)
                              });
                            }}
                          >
                            <span className="material-symbols-outlined text-[12px] text-critical">close</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                      Reactions
                    </label>
                    <div className="flex gap-2">
                      {['🔥', '💀', '👀', '💯', '🚩'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            const currentCount = selectedTicket.reactions?.[emoji] || 0;
                            setSelectedTicket({
                              ...selectedTicket,
                              reactions: {
                                ...selectedTicket.reactions,
                                [emoji]: currentCount + 1
                              }
                            });
                          }}
                          className="bg-surface/50 border border-border-dim hover:border-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-xs font-mono text-text-muted">{selectedTicket.reactions?.[emoji] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTicket.history && selectedTicket.history.length > 0 && (
                    <div>
                      <label className="text-xs font-sans font-bold text-text-muted uppercase tracking-wider mb-2 block">
                        History
                      </label>
                      <div className="space-y-2">
                        {selectedTicket.history.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs font-sans text-gray-400 bg-surface/30 p-2 rounded-lg border border-border-dim/50">
                            <span className="material-symbols-outlined text-[14px] text-text-muted">history</span>
                            <span className="font-mono text-[10px] text-text-muted">{new Date(entry.date).toLocaleString()}</span>
                            <span>{entry.action}</span>
                            <span className="ml-auto text-[10px] bg-surface px-2 py-0.5 rounded-md">{entry.user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-border-dim bg-surface-dim/50 flex justify-between items-center shrink-0">
                {!isCreating ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="px-4 py-2.5 text-xs font-sans font-bold text-critical hover:bg-critical/10 border border-transparent hover:border-critical rounded-xl transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                    DELETE
                  </motion.button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-xs font-sans font-bold text-text-muted hover:text-white bg-surface hover:bg-surface-dim border border-border-dim rounded-xl transition-colors"
                  >
                    CANCEL
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateTicket(selectedTicket)}
                    className="px-5 py-2.5 text-xs font-sans font-bold bg-primary text-black hover:bg-primary/90 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isCreating ? "add" : "save"}
                    </span>
                    {isCreating ? "CREATE TICKET" : "SAVE CHANGES"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
