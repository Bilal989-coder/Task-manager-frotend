import React, { useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import MyTasks from "./pages/MyTasks";
import { useAuth } from "./auth/AuthContext";
import { ProtectedRoute, AdminRoute } from "./auth/ProtectedRoute";
import { roleLabel } from "./utils/roleLabel";
import {
  Layout,
  LogOut,
  User2,
  ShieldCheck,
  ListChecks,
  Menu,
  X,
} from "lucide-react";

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const homePath = user?.role === "admin" ? "/admin" : "/my-tasks";

  return (
    <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          to={homePath}
          className="flex items-center gap-2 font-extrabold text-slate-900"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Layout size={18} />
          </span>
          <span className="tracking-tight">TaskFlow Pro</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <User2 size={16} />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-extrabold text-slate-900">
                    {user.name}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    {roleLabel(user.role)}
                  </div>
                </div>
              </div>

              {user.role === "admin" ? (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck size={16} />
                  Manager
                </Link>
              ) : (
                <Link
                  to="/my-tasks"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  <ListChecks size={16} />
                  My Tasks
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 active:scale-[0.98]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        {user ? (
          <button
            onClick={() => setOpen((p) => !p)}
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        ) : null}
      </div>

      {/* Mobile dropdown */}
      {user && open ? (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700">
                <User2 size={18} />
              </span>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  {user.name}
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {roleLabel(user.role)}
                </div>
              </div>
            </div>

            {user.role === "admin" ? (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} /> Manager Dashboard
                </span>
              </Link>
            ) : (
              <Link
                to="/my-tasks"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <ListChecks size={16} /> My Tasks
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  // ✅ Login screen per Topbar hide
  const hideTopbar = useMemo(() => {
    return location.pathname === "/login";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {!hideTopbar && <Topbar />}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/my-tasks" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* optional: unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
