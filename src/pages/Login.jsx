import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Mail, Lock, Loader2, Layout, ShieldCheck, Users } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role === "admin") navigate("/admin", { replace: true });
      else navigate("/my-tasks", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@example.com");
      setPassword("password123");
    } else {
      setEmail("member@example.com");
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Perfect center wrapper */}
      <div className="min-h-screen grid place-items-center px-4 py-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="grid lg:grid-cols-2">
            {/* ✅ LEFT: Branding (Desktop) + also shows small header on mobile inside card */}
            <div className="bg-slate-900 text-white p-8 md:p-12">
              {/* Mobile + Desktop Brand */}
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-2xl">
                  <Layout size={22} />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-extrabold leading-tight">
                    TaskFlow Pro
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">
                    Secure Internal Workspace
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
                  Welcome back 👋
                </h1>
                <p className="mt-2 text-sm md:text-base text-slate-300">
                  Sign in to manage tasks & track progress like a pro.
                </p>
              </div>

              {/* Desktop only extras */}
              <div className="hidden lg:block mt-10 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-800 p-2 rounded-2xl shrink-0">
                    <ShieldCheck size={20} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-200 font-semibold">
                    Full control over projects, team members, and deadlines.
                  </p>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-slate-800 p-2 rounded-2xl shrink-0">
                    <Users size={20} className="text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-200 font-semibold">
                    Members update status so you track progress in real-time.
                  </p>
                </div>
              </div>

              <div className="hidden lg:block mt-12 text-xs text-slate-400 font-semibold">
                © 2024 YourCompany Inc. Secure Internal Access
              </div>
            </div>

            {/* ✅ RIGHT: Form */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-7">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  Sign in
                </h2>
                <p className="text-slate-500 mt-2">
                  Please enter your details to continue.
                </p>
              </div>

              {err && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {err}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all text-base"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all text-base"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                </button>
              </form>

              {/* Quick Demo */}
              <div className="mt-8 border-t border-slate-100 pt-5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 text-center">
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin")}
                    className="py-3 px-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-all"
                  >
                    Manager Account
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("member")}
                    className="py-3 px-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 active:bg-slate-200 transition-all"
                  >
                    Member Account
                  </button>
                </div>
              </div>

              {/* Mobile footer inside card */}
              <div className="lg:hidden mt-8 text-center text-xs text-slate-400 font-semibold">
                © 2024 YourCompany Inc. Secure Internal Access
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
