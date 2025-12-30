import React, { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import {
  Search,
  RefreshCw,
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  RotateCcw,
} from "lucide-react";

const STATUSES = ["Todo", "In Progress", "Done"];
const PRIORITIES = ["All", "Low", "Medium", "High"];

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function isOverdue(dueDate, status) {
  return dueDate && new Date(dueDate) < new Date() && status !== "Done";
}

function priorityBar(p) {
  if (p === "High") return "bg-red-500";
  if (p === "Medium") return "bg-amber-400";
  if (p === "Low") return "bg-slate-300";
  return "bg-slate-200";
}

function priorityDot(p) {
  if (p === "High") return "bg-red-500";
  if (p === "Medium") return "bg-amber-400";
  if (p === "Low") return "bg-slate-400";
  return "bg-slate-300";
}

function StatusPill({ status }) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold";
  if (status === "Done")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        <CheckCircle2 size={14} />
        Done
      </span>
    );
  if (status === "In Progress")
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>
        <Clock3 size={14} />
        In Progress
      </span>
    );
  return (
    <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
      <ListChecks size={14} />
      Todo
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = priority || "Medium";
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold";
  if (p === "High")
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        <span className={`h-2 w-2 rounded-full ${priorityDot(p)}`} />
        High
      </span>
    );
  if (p === "Medium")
    return (
      <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>
        <span className={`h-2 w-2 rounded-full ${priorityDot(p)}`} />
        Medium
      </span>
    );
  return (
    <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
      <span className={`h-2 w-2 rounded-full ${priorityDot(p)}`} />
      Low
    </span>
  );
}

function StatCard({ label, value, icon, tone = "slate" }) {
  const tones = {
    slate: "text-slate-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
    amber: "text-amber-800",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
            {label}
          </div>
          <div className={`mt-1 text-2xl font-extrabold ${tones[tone] || tones.slate}`}>
            {value}
          </div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await http.get("/api/tasks/my");
      setTasks(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = (searchDebounced || "").toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !q ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);

      const matchesStatus = status === "All" ? true : t.status === status;

      const p = t.priority || "Medium";
      const matchesPriority = priority === "All" ? true : p === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchDebounced, status, priority]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "Todo").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      done: tasks.filter((t) => t.status === "Done").length,
      overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
    };
  }, [tasks]);

  const updateStatus = async (taskId, nextStatus) => {
    const prev = tasks;
    setTasks((p) => p.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t)));

    try {
      const { data } = await http.patch(`/api/tasks/${taskId}/status`, { status: nextStatus });
      setTasks((p) => p.map((t) => (t._id === data._id ? data : t)));
    } catch (e) {
      setTasks(prev);
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Tasks
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Update progress so manager can track everything.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5" />
              <div>
                <div className="font-extrabold">Error</div>
                <div className="mt-0.5">{err}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.total} icon={<ListChecks size={18} />} />
          <StatCard label="Todo" value={stats.todo} icon={<ListChecks size={18} />} />
          <StatCard label="In Progress" value={stats.inProgress} tone="blue" icon={<Clock3 size={18} />} />
          <StatCard label="Done" value={stats.done} tone="emerald" icon={<CheckCircle2 size={18} />} />
          <StatCard label="Overdue" value={stats.overdue} tone="red" icon={<AlertTriangle size={18} />} />
        </div>

        {/* Filters */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
            >
              <option value="All">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "All Priority" : `${p} Priority`}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-extrabold text-slate-700">{filtered.length}</span> result(s)
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
              <Loader2 className="animate-spin text-slate-900 mb-2" size={32} />
              <p className="text-slate-500 ml-3">Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 text-[10px] uppercase tracking-widest font-extrabold">
                    <tr>
                      <th className="px-6 py-4">Task</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Due</th>
                      <th className="px-6 py-4">Update</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((t) => {
                      const p = t.priority || "Medium";
                      const overdue = isOverdue(t.dueDate, t.status);

                      return (
                        <tr
                          key={t._id}
                          className={`transition-colors hover:bg-slate-50/60 ${
                            overdue ? "bg-red-50" : p === "High" ? "bg-amber-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <span className={`mt-1 h-10 w-1 rounded-full ${priorityBar(p)}`} />
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-900 truncate">{t.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  {t.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <StatusPill status={t.status || "Todo"} />
                          </td>

                          <td className="px-6 py-4">
                            <PriorityBadge priority={p} />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="inline-flex items-center gap-2">
                              <Calendar size={14} className={overdue ? "text-red-500" : "text-slate-400"} />
                              <span className={overdue ? "text-red-700 font-extrabold" : "font-semibold"}>
                                {formatDate(t.dueDate)}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={t.status || "Todo"}
                              onChange={(e) => updateStatus(t._id, e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!filtered.length ? (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    No tasks found for selected filters.
                  </div>
                ) : null}
              </div>

              {/* ✅ Mobile Admin-style Cards */}
              <div className="md:hidden space-y-4">
                {filtered.map((t) => {
                  const p = t.priority || "Medium";
                  const overdue = isOverdue(t.dueDate, t.status);

                  return (
                    <div
                      key={t._id}
                      className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${
                        overdue ? "border-red-200" : "border-slate-200"
                      }`}
                    >
                      {/* Top Accent */}
                      <div className={`h-1.5 w-full ${priorityBar(p)}`} />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-lg truncate">
                              {t.title}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <StatusPill status={t.status || "Todo"} />
                              <PriorityBadge priority={p} />
                              {overdue ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-800 px-3 py-1 text-[11px] font-extrabold">
                                  <AlertTriangle size={14} />
                                  Overdue
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {t.description ? (
                          <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                            {t.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-slate-400">No description</p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Calendar size={14} className={overdue ? "text-red-500" : "text-slate-400"} />
                            <span className={overdue ? "text-red-700 font-extrabold" : ""}>
                              {formatDate(t.dueDate)}
                            </span>
                          </div>

                          <select
                            value={t.status || "Todo"}
                            onChange={(e) => updateStatus(t._id, e.target.value)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold outline-none"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!filtered.length ? (
                  <div className="bg-white rounded-2xl border p-10 text-center text-slate-600 shadow-sm">
                    <div className="text-lg font-extrabold text-slate-900">No tasks found</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Try changing filters or wait for manager to assign tasks.
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
