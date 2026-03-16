"use client";
import { useState } from "react";
import Link from "next/link";
import {
  TicketPlus, MessageCircle, Clock, CheckCircle2, AlertCircle, User, LogOut,
  Home, FileText, CreditCard, Bell, Settings, ChevronDown, Send, Plus, Filter, Search
} from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

interface Message {
  id: number;
  sender: "consultant" | "srs_team";
  senderName: string;
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const initialTickets: Ticket[] = [
  {
    id: "TKT-2026-001",
    subject: "Timesheet submission issue for March week 2",
    category: "Timesheet",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-03-10 09:15",
    updatedAt: "2026-03-11 14:30",
    messages: [
      { id: 1, sender: "consultant", senderName: "You", text: "I'm unable to submit my timesheet for the week of March 9-13. The system shows an error when I click submit. Can someone help?", timestamp: "Mar 10, 9:15 AM" },
      { id: 2, sender: "srs_team", senderName: "Priya (SRS Support)", text: "Hi, thank you for reporting this. We've identified a system maintenance issue. Can you try clearing your browser cache and submitting again? If the issue persists, I'll escalate it to our IT team.", timestamp: "Mar 10, 11:30 AM" },
      { id: 3, sender: "consultant", senderName: "You", text: "I cleared the cache and tried again but still getting the same error. Here's the error code: TS-ERR-408.", timestamp: "Mar 11, 10:00 AM" },
      { id: 4, sender: "srs_team", senderName: "Priya (SRS Support)", text: "Thank you for the error code. I've escalated this to our IT team. They are working on a fix. Expected resolution within 24 hours. I'll update you once it's resolved.", timestamp: "Mar 11, 2:30 PM" },
    ],
  },
  {
    id: "TKT-2026-002",
    subject: "Request for project documentation access",
    category: "Project",
    priority: "medium",
    status: "resolved",
    createdAt: "2026-03-05 16:00",
    updatedAt: "2026-03-07 10:00",
    messages: [
      { id: 1, sender: "consultant", senderName: "You", text: "I need access to the project documentation for the BFSI modernization project. My current permissions don't include the shared drive.", timestamp: "Mar 5, 4:00 PM" },
      { id: 2, sender: "srs_team", senderName: "Arun (Project Manager)", text: "Access has been granted. You should now be able to see the shared drive under Projects > BFSI-2026. Let me know if you face any issues.", timestamp: "Mar 7, 10:00 AM" },
    ],
  },
  {
    id: "TKT-2026-003",
    subject: "Payroll discrepancy for February",
    category: "Payroll",
    priority: "urgent",
    status: "open",
    createdAt: "2026-03-12 08:30",
    updatedAt: "2026-03-12 08:30",
    messages: [
      { id: 1, sender: "consultant", senderName: "You", text: "My February payslip shows a discrepancy. The overtime hours are not reflected correctly. I worked 12 extra hours which were approved by my manager.", timestamp: "Mar 12, 8:30 AM" },
    ],
  },
];

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-500", icon: CheckCircle2 },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-50 text-blue-600" },
  high: { label: "High", color: "bg-orange-50 text-orange-600" },
  urgent: { label: "Urgent", color: "bg-red-50 text-red-600" },
};

export default function ConsultantDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "timesheets" | "payroll" | "profile">("tickets");

  // New ticket form
  const [newTicket, setNewTicket] = useState({ subject: "", category: "General", priority: "medium" as TicketPriority, message: "" });

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.message) return;
    const ticket: Ticket = {
      id: `TKT-2026-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "open",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      messages: [{ id: 1, sender: "consultant", senderName: "You", text: newTicket.message, timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }],
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: "", category: "General", priority: "medium", message: "" });
    setShowNewTicket(false);
    setSelectedTicket(ticket);
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        const newMsg: Message = {
          id: t.messages.length + 1,
          sender: "consultant",
          senderName: "You",
          text: replyText,
          timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        };
        return { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toLocaleString() };
      }
      return t;
    });
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find((t) => t.id === selectedTicket.id) || null);
    setReplyText("");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-sm font-bold">JD</div>
            <div>
              <div className="text-sm font-semibold">John Doe</div>
              <div className="text-xs text-gray-400">SRS-CON-4521</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "tickets" as const, icon: TicketPlus, label: "Support Tickets", badge: tickets.filter(t => t.status !== "closed" && t.status !== "resolved").length },
            { id: "timesheets" as const, icon: FileText, label: "Timesheets" },
            { id: "payroll" as const, icon: CreditCard, label: "Payroll" },
            { id: "profile" as const, icon: User, label: "My Profile" },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedTicket(null); setShowNewTicket(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${activeTab === item.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={18} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-primary">
              {activeTab === "tickets" ? "Support Tickets" : activeTab === "timesheets" ? "Timesheets" : activeTab === "payroll" ? "Payroll" : "My Profile"}
            </h1>
            <p className="text-xs text-gray-400">Consultant Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        {activeTab === "tickets" && (
          <div className="flex-1 flex">
            {/* Ticket list panel */}
            <div className={`${selectedTicket || showNewTicket ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[400px] bg-white border-r border-gray-200`}>
              {/* Search & filter bar */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tickets..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-accent" />
                  </div>
                  <button onClick={() => { setShowNewTicket(true); setSelectedTicket(null); }}
                    className="px-3 py-2 bg-accent text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-accent-dark transition-colors whitespace-nowrap">
                    <Plus size={14} /> New
                  </button>
                </div>
                <div className="flex gap-1">
                  {["all", "open", "in_progress", "resolved"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-white" : "bg-surface text-gray-500 hover:bg-gray-200"}`}>
                      {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket list */}
              <div className="flex-1 overflow-y-auto">
                {filteredTickets.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No tickets found</div>
                )}
                {filteredTickets.map((ticket) => {
                  const sc = statusConfig[ticket.status];
                  const pc = priorityConfig[ticket.priority];
                  return (
                    <button key={ticket.id} onClick={() => { setSelectedTicket(ticket); setShowNewTicket(false); }}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-surface transition-colors ${selectedTicket?.id === ticket.id ? "bg-surface border-l-3 border-l-accent" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 font-mono">{ticket.id}</div>
                          <div className="text-sm font-medium text-primary mt-0.5 truncate">{ticket.subject}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${sc.color}`}>{sc.label}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pc.color}`}>{pc.label}</span>
                            <span className="text-[10px] text-gray-400">{ticket.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                          <MessageCircle size={10} /> {ticket.messages.length}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ticket detail / New ticket panel */}
            <div className="flex-1 flex flex-col">
              {showNewTicket ? (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-primary">Raise a New Ticket</h2>
                      <button onClick={() => setShowNewTicket(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject *</label>
                        <input value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Brief description of your issue"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                          <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white">
                            <option>General</option>
                            <option>Timesheet</option>
                            <option>Payroll</option>
                            <option>Project</option>
                            <option>IT Support</option>
                            <option>HR & Benefits</option>
                            <option>Travel & Expenses</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
                          <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as TicketPriority})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Description *</label>
                        <textarea rows={6} value={newTicket.message} onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                          placeholder="Describe your issue in detail. Include any relevant IDs, dates, or screenshots..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent resize-none" />
                      </div>
                      <button onClick={handleCreateTicket}
                        className="px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center gap-2">
                        <TicketPlus size={16} /> Submit Ticket
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedTicket ? (
                <>
                  {/* Ticket header */}
                  <div className="bg-white border-b border-gray-200 p-6">
                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden text-accent text-sm font-semibold mb-3">← Back</button>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">{selectedTicket.id}</div>
                        <h2 className="text-lg font-semibold text-primary">{selectedTicket.subject}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusConfig[selectedTicket.status].color}`}>
                            {statusConfig[selectedTicket.status].label}
                          </span>
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${priorityConfig[selectedTicket.priority].color}`}>
                            {priorityConfig[selectedTicket.priority].label}
                          </span>
                          <span className="text-xs text-gray-400">Category: {selectedTicket.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface">
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "consultant" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] ${msg.sender === "consultant" ? "bg-primary text-white" : "bg-white border border-gray-200"} rounded-xl p-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${msg.sender === "consultant" ? "bg-white/20 text-white" : "bg-teal/10 text-teal"}`}>
                              {msg.sender === "consultant" ? "Y" : "S"}
                            </div>
                            <span className={`text-xs font-semibold ${msg.sender === "consultant" ? "text-white/80" : "text-primary"}`}>{msg.senderName}</span>
                            <span className={`text-[10px] ${msg.sender === "consultant" ? "text-white/50" : "text-gray-400"}`}>{msg.timestamp}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${msg.sender === "consultant" ? "text-white/90" : "text-gray-600"}`}>{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply input */}
                  {selectedTicket.status !== "closed" && (
                    <div className="bg-white border-t border-gray-200 p-4">
                      <div className="flex gap-3">
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..." rows={2}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent resize-none"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }}}
                        />
                        <button onClick={handleReply}
                          className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors self-end">
                          <Send size={18} />
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Select a ticket or create a new one</h3>
                    <p className="text-sm text-gray-400 mb-6">Your support conversations with the SRS team appear here.</p>
                    <button onClick={() => setShowNewTicket(true)}
                      className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors inline-flex items-center gap-2">
                      <Plus size={16} /> Raise a Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs: placeholders */}
        {activeTab === "timesheets" && (
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-primary mb-6">Timesheets</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Week</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { week: "Mar 9 - Mar 15", hours: "40", project: "BFSI Modernization", status: "Pending" },
                      { week: "Mar 2 - Mar 8", hours: "42", project: "BFSI Modernization", status: "Approved" },
                      { week: "Feb 23 - Mar 1", hours: "40", project: "BFSI Modernization", status: "Approved" },
                      { week: "Feb 16 - Feb 22", hours: "38", project: "BFSI Modernization", status: "Approved" },
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-6 py-4 font-medium text-primary">{row.week}</td>
                        <td className="px-6 py-4 text-gray-600">{row.hours}h</td>
                        <td className="px-6 py-4 text-gray-600">{row.project}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${row.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-primary mb-6">Payroll & Compensation</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Current Monthly", value: "Confidential", note: "View payslip" },
                  { label: "YTD Earnings", value: "Confidential", note: "3 months" },
                  { label: "Next Pay Date", value: "Mar 31, 2026", note: "In 16 days" },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{card.label}</div>
                    <div className="text-2xl font-bold text-primary mt-2">{card.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{card.note}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-primary mb-4">Recent Payslips</h3>
                {["February 2026", "January 2026", "December 2025"].map((month, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{month}</span>
                    <button className="text-accent text-xs font-semibold hover:underline">Download PDF</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-primary mb-6">My Profile</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-2xl font-bold text-white">JD</div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">John Doe</h3>
                    <div className="text-sm text-gray-400">Consultant ID: SRS-CON-4521</div>
                    <div className="text-sm text-teal font-medium mt-1">Active</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Email", value: "john.doe@email.com" },
                    { label: "Phone", value: "+91-98765-43210" },
                    { label: "Department", value: "Engineering" },
                    { label: "Current Project", value: "BFSI Modernization" },
                    { label: "Location", value: "Chennai, India" },
                    { label: "Joined", value: "October 2024" },
                  ].map((field, i) => (
                    <div key={i}>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{field.label}</div>
                      <div className="text-sm text-primary mt-1">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
