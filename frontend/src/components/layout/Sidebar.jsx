import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiBookOpen,
  FiUser,
  FiUsers,
  FiArrowRight,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiLogOut,
} from "react-icons/fi";

const NAV_CONFIG = {
  ADMIN: [
    {
      section: "Overview",
      links: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/admin/profile", label: "My Profile", icon: "student" },
      ],
    },
    {
      section: "Management",
      links: [
        { to: "/admin/schools", label: "Schools", icon: "school" },
        { to: "/admin/students", label: "Students", icon: "student" },
        { to: "/admin/users", label: "Users", icon: "users" },
        { to: "/admin/transfers", label: "Transfers", icon: "transfers" },
      ],
    },
    {
      section: "Reports",
      links: [
        {
          to: "/admin/reports/attendance",
          label: "Attendance",
          icon: "attendance",
        },
        {
          to: "/admin/reports/performance",
          label: "Performance",
          icon: "chart",
        },
      ],
    },
    {
      section: "System",
      links: [
        {
          to: "/admin/academic-years",
          label: "Academic Years",
          icon: "calendar",
        },
      ],
    },
  ],

  SCHOOL_ADMIN: [
    {
      section: "Overview",
      links: [
        { to: "/school/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/school/profile", label: "My Profile", icon: "student" },
      ],
    },
    {
      section: "School",
      links: [
        { to: "/school/students", label: "Students", icon: "student" },
        { to: "/school/teachers", label: "Teachers", icon: "users" },
        { to: "/school/transfers", label: "Transfers", icon: "transfers" },
      ],
    },
    {
      section: "Academics",
      links: [
        { to: "/school/attendance", label: "Attendance", icon: "attendance" },
        { to: "/school/grades", label: "Grades", icon: "grades" },
        { to: "/school/reports", label: "Reports", icon: "chart" },
      ],
    },
  ],

  TEACHER: [
    {
      section: "Overview",
      links: [
        { to: "/teacher/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/teacher/profile", label: "My Profile", icon: "student" },
      ],
    },
    {
      section: "Classroom",
      links: [
        { to: "/teacher/attendance", label: "Attendance", icon: "attendance" },
        { to: "/teacher/grades", label: "Enter Grades", icon: "grades" },
        { to: "/teacher/students", label: "My Students", icon: "student" },
      ],
    },
  ],

  STUDENT: [
    {
      section: "My Records",
      links: [
        { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
        { to: "/student/profile", label: "My Profile", icon: "student" },
        { to: "/student/attendance", label: "Attendance", icon: "attendance" },
        { to: "/student/results", label: "Results", icon: "chart" },
        { to: "/student/transfers", label: "Transfers", icon: "transfers" },
      ],
    },
  ],
};

function Icon({ name, className = "w-5 h-5 text-primary-200" }) {
  const iconProps = { className };
  switch (name) {
    case "dashboard":
      return <FiGrid {...iconProps} />;
    case "school":
      return <FiBookOpen {...iconProps} />;
    case "student":
      return <FiUser {...iconProps} />;
    case "users":
      return <FiUsers {...iconProps} />;
    case "transfers":
      return <FiArrowRight {...iconProps} />;
    case "attendance":
      return <FiCalendar {...iconProps} />;
    case "chart":
      return <FiBarChart2 {...iconProps} />;
    case "calendar":
      return <FiCalendar {...iconProps} />;
    case "grades":
      return <FiAward {...iconProps} />;
    default:
      return null;
  }
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = NAV_CONFIG[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="app-sidebar flex flex-col" aria-label="Main sidebar">
      <div className="sidebar-brand">
        <div className="flex items-center gap-3">
          <div className="sidebar-brand-icon inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent-400 text-neutral-900">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M12 2l8 4-8 4-8-4 8-4z" fill="currentColor" />
              <path
                d="M4 10v6c0 1.1.9 2 2 2h12"
                stroke="currentColor"
                strokeWidth="0"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <div className="brand-title">SRAMS</div>
            <div className="brand-sub">Ghana Basic Education</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav grow" aria-label="Primary navigation">
        {sections.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-label">{section.section}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
                aria-current={({ isActive }) => (isActive ? "page" : undefined)}
              >
                <span className="nav-icon">
                  <Icon name={link.icon} />
                </span>
                <span className="nav-label">{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="sidebar-signout-btn flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-100 hover:text-primary-600 transition-colors text-left cursor-pointer"
          title="Sign out"
        >
          <FiLogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
