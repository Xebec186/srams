// src/App.js
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./index.css";
import { FiLock } from "react-icons/fi";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSchools from "./pages/admin/AdminSchools";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransfers from "./pages/admin/AdminTransfers";
import {
  AdminAttendanceReport,
  AdminPerformanceReport,
} from "./pages/admin/AdminReports";
import AcademicYearsPage from "./pages/admin/AcademicYearsPage";

// School Admin Pages
import SchoolDashboard from "./pages/school-admin/SchoolDashboard";
import SchoolStudents from "./pages/school-admin/SchoolStudents";
import SchoolTeachers from "./pages/school-admin/SchoolTeachers";
import SchoolTransfers from "./pages/school-admin/SchoolTransfers";
import SchoolAttendance from "./pages/school-admin/SchoolAttendance";
import SchoolGrades from "./pages/school-admin/SchoolGrades";
import SchoolReports from "./pages/school-admin/SchoolReports";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherStudents from "./pages/teacher/TeacherStudents";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentResults from "./pages/student/StudentResults";
import StudentTransfers from "./pages/student/StudentTransfers";

// ============================================================
// Route Guards (Wrapped with Auth Context)
// ============================================================

// Requires authentication
function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Requires specific role(s)
function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

// Redirects logged-in users away from login page
function PublicOnly() {
  const { user } = useAuth();
  const REDIRECTS = {
    ADMIN: "/admin/dashboard",
    SCHOOL_ADMIN: "/school/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard",
  };
  if (user) return <Navigate to={REDIRECTS[user.role] || "/"} replace />;
  return <Outlet />;
}

// Root redirect with context access
function RootRedirectGuard() {
  const { user } = useAuth();
  const REDIRECTS = {
    ADMIN: "/admin/dashboard",
    SCHOOL_ADMIN: "/school/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard",
  };
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={REDIRECTS[user.role] || "/login"} replace />;
}

// ============================================================
// App Router Component (rendered inside AuthProvider)
// ============================================================
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirectGuard />} />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              gap: 12,
            }}
          >
            <FiLock
              style={{ fontSize: 48, color: "var(--color-primary-600)" }}
              aria-hidden
            />
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Access Denied</h1>
            <p style={{ fontSize: 14, color: "var(--color-neutral-500)" }}>
              You do not have permission to view this page.
            </p>
            <a href="/login" className="btn btn-primary">
              Back to Login
            </a>
          </div>
        }
      />

      {/* Protected shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* ---- ADMIN routes ---- */}
          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/schools" element={<AdminSchools />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/transfers" element={<AdminTransfers />} />
            <Route
              path="/admin/reports/attendance"
              element={<AdminAttendanceReport />}
            />
            <Route
              path="/admin/reports/performance"
              element={<AdminPerformanceReport />}
            />
            <Route
              path="/admin/academic-years"
              element={<AcademicYearsPage />}
            />
          </Route>

          {/* ---- SCHOOL ADMIN routes ---- */}
          <Route element={<RequireRole roles={["SCHOOL_ADMIN"]} />}>
            <Route path="/school/dashboard" element={<SchoolDashboard />} />
            <Route path="/school/students" element={<SchoolStudents />} />
            <Route path="/school/teachers" element={<SchoolTeachers />} />
            <Route path="/school/transfers" element={<SchoolTransfers />} />
            <Route path="/school/attendance" element={<SchoolAttendance />} />
            <Route path="/school/grades" element={<SchoolGrades />} />
            <Route path="/school/reports" element={<SchoolReports />} />
          </Route>

          {/* ---- TEACHER routes ---- */}
          <Route element={<RequireRole roles={["TEACHER"]} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/grades" element={<TeacherGrades />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
          </Route>

          {/* ---- STUDENT routes ---- */}
          <Route element={<RequireRole roles={["STUDENT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/transfers" element={<StudentTransfers />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ============================================================
// Root App with Provider
// ============================================================
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
