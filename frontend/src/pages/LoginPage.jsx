import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FiFlag, FiEye, FiEyeOff } from "react-icons/fi";

const ROLE_REDIRECTS = {
  ADMIN: "/admin/dashboard",
  SCHOOL_ADMIN: "/school/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export default function LoginPage() {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(ROLE_REDIRECTS[user.role] || "/");
    } catch (err) {
      toastError(
        err.response?.data?.message || "Invalid username or password.",
        "Sign in failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-primary-900 text-white p-10 hidden md:flex flex-col justify-center">
        <div className="login-hero-badge inline-flex items-center gap-3 bg-white/6 px-3 py-1 rounded-full text-sm font-medium w-max">
          <FiFlag
            style={{ color: "var(--color-accent-500)" }}
            size={18}
            aria-hidden
          />
          <span>Ghana Education Service</span>
        </div>

        <h1 className="mt-6 text-4xl font-display font-bold leading-tight text-white">
          Student Records &amp; Attendance Management System
        </h1>

        <p className="mt-4 text-sm text-primary-200 max-w-md">
          A unified platform for tracking student records, attendance, academic
          performance, and transfers across public basic education schools in
          Ghana.
        </p>

        <div className="mt-8 flex gap-8">
          {[
            { label: "200+", desc: "Schools" },
            { label: "50K+", desc: "Students" },
            { label: "16", desc: "Regions" },
          ].map(({ label, desc }) => (
            <div key={desc} className="z-10">
              <div className="text-2xl font-bold text-white">{label}</div>
              <div className="text-xs text-primary-200 mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          <h2 className="login-form-title text-2xl font-display font-bold mb-1">
            Sign In
          </h2>
          <p className="login-form-subtitle text-sm text-neutral-500 mb-6">
            Enter your credentials to access the system.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label mb-0">Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group relative">
              <label className="form-label mt-4 mb-0">Password</label>
              <div className="relative">
                <input
                  className="form-control pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full mt-6"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400 mt-6">
            Contact your school administrator if you need account access.
          </p>
        </div>
      </div>
    </div>
  );
}
