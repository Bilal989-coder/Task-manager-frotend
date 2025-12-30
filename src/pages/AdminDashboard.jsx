import React, { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";
import {
  Plus,
  Search,
  RefreshCw,
  Calendar,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
} from "lucide-react";

const STATUS_OPTIONS = ["All", "Todo", "In Progress", "Done"];
const PRIORITY_OPTIONS = ["All", "Low", "Medium", "High"];

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

function priorityBar(p) {
  if (p === "High") return "bg-red-500";
  if (p === "Medium") return "bg-amber-400";
  return "bg-slate-300";
}

function priorityDot(p) {
  if (p === "High") return "bg-red-500";
  if (p === "Medium") return "bg-amber-400";
  return "bg-slate-400";
}

function rowEmphasis(p, dueDate, status) {
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "Done";
  if (isOverdue) return "bg-red-50";
  if (p === "High") return "bg-amber-50";
  return "";
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [tasksRes, setTasksRes] = useState({
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 8,
  });
  const [users, setUsers] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [assignee, setAssignee] = useState("All");

  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [createErr, setCreateErr] = useState("");
  const [editErr, setEditErr] = useState("");

  // ✅ Users except admin (manager UI name)
  const assignableUsers = useMemo(
    () => users.filter((u) => u.role !== "admin"),
    [users]
  );

  // ✅ Debounce search to avoid API spam
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // ✅ Filter mode check (agar koi filter/search active ho)
  const isFiltered = useMemo(() => {
    return (
      (searchDebounced && searchDebounced.length > 0) ||
      status !== "All" ||
      priority !== "All" ||
      assignee !== "All"
    );
  }, [searchDebounced, status, priority, assignee]);

  const fetchUsers = async () => {
    try {
      const { data } = await http.get("/api/users");
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      console.error("User fetch error", e);
    }
  };

  // ✅ Build params: if filtered -> no pagination
  const buildParams = (nextPage) => {
    const base = {
      search: searchDebounced || "",
      status: status === "All" ? "" : status,
      priority: priority === "All" ? "" : priority,
      assignedTo: assignee === "All" ? "" : assignee,
    };

    // ✅ If filters/search applied -> fetch all (no page UI)
    if (isFiltered) {
      return { ...base, page: 1, limit: 1000 };
    }

    // ✅ Normal mode -> pagination
    return { ...base, page: nextPage, limit };
  };

  const fetchTasks = async (nextPage = 1) => {
    setLoading(true);
    try {
      const { data } = await http.get("/api/tasks", {
        params: buildParams(nextPage),
      });

      setTasksRes(data);

      // ✅ If filtered, keep page fixed at 1
      setPage(isFiltered ? 1 : data.page);
    } catch (e) {
      console.error("Task fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ whenever filters change → reset to page 1 (also disables pagination view)
  useEffect(() => {
    fetchTasks(1);
  }, [searchDebounced, status, assignee, priority]);

  const stats = useMemo(() => {
    const items = tasksRes.items || [];
    return {
      total: tasksRes.total || 0,
      todo: items.filter((t) => t.status === "Todo").length,
      inProgress: items.filter((t) => t.status === "In Progress").length,
      done: items.filter((t) => t.status === "Done").length,
      overdue: items.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done"
      ).length,
    };
  }, [tasksRes]);

  const createTask = async (payload) => {
    setCreateErr("");
    try {
      await http.post("/api/tasks", { ...payload, status: "Todo" });
      setOpenCreate(false);
      fetchTasks(1);
    } catch (e) {
      setCreateErr(e?.response?.data?.message || "Failed to create task");
    }
  };

  const saveEdit = async (payload) => {
    setEditErr("");
    try {
      await http.put(`/api/tasks/${editTask._id}`, payload);
      setOpenEdit(false);
      setEditTask(null);
      // ✅ if filtered -> keep page 1 else current page
      fetchTasks(isFiltered ? 1 : page);
    } catch (e) {
      setEditErr(e?.response?.data?.message || "Failed to update task");
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await http.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks(isFiltered ? 1 : page);
    } catch {
      alert("Update failed");
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await http.delete(`/api/tasks/${taskId}`);

      // ✅ if filtered -> always reload page 1
      if (isFiltered) {
        fetchTasks(1);
        return;
      }

      // normal pagination behavior
      const next = tasksRes.items.length === 1 && page > 1 ? page - 1 : page;
      fetchTasks(next);
    } catch {
      alert("Delete failed");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
    setAssignee("All");
    setPage(1);
  };

  const tasks = tasksRes.items || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Manager Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage team tasks with priority, due dates, and status tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTasks(isFiltered ? 1 : page)}
              className="p-2.5 bg-white border rounded-xl hover:bg-slate-50 shadow-sm transition-all text-slate-700"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setOpenCreate(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Stats (✅ High Priority card removed) */}
        <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-5 gap-4 no-scrollbar">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Todo" value={stats.todo} color="text-slate-600" />
          <StatCard label="In Progress" value={stats.inProgress} color="text-blue-600" />
          <StatCard label="Done" value={stats.done} color="text-emerald-600" />
          <StatCard label="Overdue" value={stats.overdue} color="text-red-600" />
        </div>

        {/* Filters */}
        <div className="mt-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} Status</option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>

              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none"
              >
                <option value="All">All Team Members</option>
                {assignableUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Showing <span className="font-semibold">{tasks.length}</span> tasks
                {isFiltered ? (
                  <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    Filtered view
                  </span>
                ) : null}
              </div>

              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                title="Reset filters"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <Loader2 className="animate-spin text-black mb-2" size={32} />
              <p className="text-slate-500">Loading tasks...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">Task</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Assignee</th>
                      <th className="px-6 py-4">Due</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((t) => {
                      const p = t.priority || "Medium";
                      const rowBg = rowEmphasis(p, t.dueDate, t.status);

                      return (
                        <tr key={t._id} className={`transition-colors hover:bg-slate-50/60 ${rowBg}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <span className={`mt-1 h-10 w-1 rounded-full ${priorityBar(p)}`} />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{t.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  {t.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={t.status || "Todo"}
                              onChange={(e) => updateStatus(t._id, e.target.value)}
                              className="text-[11px] font-bold w-fit bg-slate-100 px-2.5 py-2 rounded-lg border border-slate-200 outline-none"
                            >
                              {STATUS_OPTIONS.slice(1).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${priorityDot(p)}`} />
                              <Badge variant={p}>{p}</Badge>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-700">
                              {t.assignedTo?.name || "Unassigned"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="inline-flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(t.dueDate)}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setEditTask(t); setOpenEdit(true); }}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                title="Edit"
                              >
                                <Edit3 size={16} />
                                Edit
                              </button>

                              <button
                                onClick={() => deleteTask(t._id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!tasks.length ? (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    No tasks found for the selected filters.
                  </div>
                ) : null}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {tasks.map((t) => {
                  const p = t.priority || "Medium";
                  const overdue =
                    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done";

                  return (
                    <div
                      key={t._id}
                      className={`bg-white p-5 rounded-3xl border shadow-sm relative overflow-hidden ${
                        overdue ? "border-red-200" : "border-slate-200"
                      }`}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${priorityBar(p)}`} />

                      <div className="flex justify-between items-start gap-3 mb-4">
                        <select
                          value={t.status || "Todo"}
                          onChange={(e) => updateStatus(t._id, e.target.value)}
                          className="text-[11px] font-bold bg-slate-100 px-2.5 py-2 rounded-lg border border-slate-200"
                        >
                          {STATUS_OPTIONS.slice(1).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditTask(t); setOpenEdit(true); }}
                            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTask(t._id)}
                            className="p-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg mb-1">{t.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {t.description || "No description"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`h-2.5 w-2.5 rounded-full ${priorityDot(p)}`} />
                        <Badge variant={p}>{p} Priority</Badge>
                        {overdue ? (
                          <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
                            {t.assignedTo?.name?.charAt(0) || "?"}
                          </div>
                          <span className="font-bold text-slate-700">
                            {t.assignedTo?.name || "Unassigned"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-600 font-semibold">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDate(t.dueDate)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!tasks.length ? (
                  <div className="p-10 text-center text-slate-500 text-sm bg-white rounded-2xl border">
                    No tasks found for the selected filters.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* ✅ Pagination: Only show when NOT filtered */}
        {!loading && !isFiltered && tasksRes.pages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500">
              PAGE {page} / {tasksRes.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => fetchTasks(page - 1)}
                className="p-2 border rounded-xl disabled:opacity-20 hover:bg-slate-50"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page >= tasksRes.pages || loading}
                onClick={() => fetchTasks(page + 1)}
                className="p-2 border rounded-xl disabled:opacity-20 hover:bg-slate-50"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={openCreate} title="New Task" onClose={() => setOpenCreate(false)}>
        <TaskForm
          users={assignableUsers}
          onSubmit={createTask}
          onCancel={() => setOpenCreate(false)}
          error={createErr}
        />
      </Modal>

      <Modal open={openEdit} title="Modify Task" onClose={() => setOpenEdit(false)}>
        <TaskForm
          users={assignableUsers}
          initialValues={editTask}
          onSubmit={saveEdit}
          onCancel={() => setOpenEdit(false)}
          error={editErr}
        />
      </Modal>
    </div>
  );
}
