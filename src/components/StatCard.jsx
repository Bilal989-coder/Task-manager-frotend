import React from "react";

export default function StatCard({ label, value, sub, color = "text-blue-600" }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 min-w-[160px] flex-1 hover:shadow-md transition-shadow">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500 font-medium">{sub}</div>}
    </div>
  );
}