import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentsApi, schoolsApi, transfersApi } from "../../api";
import { StatCard, PageHeader, Spinner } from "../../components/common";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

function IconSchool() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 3L2 8l10 5 10-5-10-5z" fill="currentColor" />
      <path d="M4 10v6a2 2 0 002 2h12a2 2 0 002-2v-6" fill="currentColor" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3" fill="currentColor" />
      <path d="M5 20c1.5-3 6-4 7-4s5.5 1 7 4" fill="currentColor" />
    </svg>
  );
}

function IconTransfers() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await schoolsApi.getSystemStats();
        const s = res.data;
        setStats({
          schools: s.totalSchools,
          students: s.totalStudents,
          transfers: s.totalTransfers,
          attendanceRate:
            s.averageAttendanceRate > 0 ? `${s.averageAttendanceRate}%` : "—",
        });
      } catch {
        setStats({
          schools: 0,
          students: 0,
          transfers: 0,
          attendanceRate: "—",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const enrollmentData = [
    { year: "2021", students: 38200 },
    { year: "2022", students: 41500 },
    { year: "2023", students: 45800 },
    { year: "2024", students: 49200 },
  ];

  const regionData = [
    { region: "Ashanti", schools: 32 },
    { region: "Gr. Accra", schools: 28 },
    { region: "Northern", schools: 24 },
    { region: "Eastern", schools: 21 },
    { region: "Central", schools: 18 },
    { region: "Western", schools: 16 },
  ];

  if (loading) return <Spinner center />;

  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="Ghana Education Service — Student Records and Attendance Management"
      />

      <div className="stat-grid flex flex-col sm:flex-row gap-4 mb-6">
        <StatCard
          icon={<IconSchool />}
          value={stats.schools}
          label="Registered Schools"
          colorClass="teal"
        />
        <StatCard
          icon={<IconUser />}
          value={stats.students.toLocaleString()}
          label="Total Students"
          colorClass="blue"
        />
        <StatCard
          icon={<IconTransfers />}
          value={stats.transfers}
          label="Transfer Requests"
          colorClass="amber"
        />
        <StatCard
          icon={<IconCalendar />}
          value={stats.attendanceRate}
          label="System Attendance Rate"
          colorClass="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Enrolment Trend</span>
            <span className="text-sm text-neutral-400">2021–2024</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={enrollmentData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-neutral-100)"
                />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="var(--color-primary-500)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary-500)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Schools by Region</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regionData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="region"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip />
                <Bar
                  dataKey="schools"
                  fill="var(--color-primary-400)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        <div className="card-body grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Add School", to: "/admin/schools", icon: <IconSchool /> },
            { label: "Add Student", to: "/admin/students", icon: <IconUser /> },
            {
              label: "Add User",
              to: "/admin/users",
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6z"
                    fill="currentColor"
                  />
                  <path
                    d="M2 20a6 6 0 0112 0"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
              ),
            },
            {
              label: "View Transfers",
              to: "/admin/transfers",
              icon: <IconTransfers />,
            },
            {
              label: "Attendance Report",
              to: "/admin/reports/attendance",
              icon: <IconCalendar />,
            },
            {
              label: "Performance Report",
              to: "/admin/reports/performance",
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="10"
                    width="3"
                    height="10"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="10.5"
                    y="6"
                    width="3"
                    height="14"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="17"
                    y="2"
                    width="3"
                    height="18"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
              ),
            },
          ].map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-primary-50 transition"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
