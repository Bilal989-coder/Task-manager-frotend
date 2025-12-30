import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, Tag, User } from "lucide-react";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

export default function TaskForm({ users = [], initialValues, onSubmit, onCancel, submitLabel = "Save Task", error }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    setTitle(initialValues?.title || "");
    setDescription(initialValues?.description || "");
    setAssignedTo(initialValues?.assignedTo?._id || initialValues?.assignedTo || (users[0]?._id || ""));
    setDueDate(initialValues?.dueDate ? new Date(initialValues.dueDate).toISOString().slice(0, 10) : "");
    setPriority(initialValues?.priority || "Medium");
  }, [initialValues, users]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
    });
  };

  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Task Title</label>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Detailed Description</label>
        <textarea className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Add more context here..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
            <User size={12} /> Assign To
          </label>
          <select className={inputClass} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
            <Calendar size={12} /> Due Date
          </label>
          <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
          <Tag size={12} /> Priority Level
        </label>
        <div className="mt-2 flex gap-2">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                priority === p 
                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Discard
        </button>
        <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}