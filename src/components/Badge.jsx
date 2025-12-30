import React from "react";

const styles = {
  // Priority
  High: "bg-red-50 text-red-700 ring-red-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-slate-100 text-slate-700 ring-slate-200",

  // Status (optional)
  Todo: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  Done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function Badge({ variant = "Low", children, className = "" }) {
  const cls = styles[variant] || styles.Low;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1",
        cls,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
