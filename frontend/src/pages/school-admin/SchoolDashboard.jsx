import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi } from "../../api";
import { StatCard, PageHeader, Spinner } from "../../components/common";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#1a6b6b", "#dc2626", "#d97706", "#2563eb"];

export default function SchoolDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    active: 0,
    transfers: 0,
    attendance: "—",
  });
  const [gradeData, setGradeData] = useState([]);
  const [attData, setAttData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const schoolId = user?.schoolId;
        const [sRes] = await Promise.all([
          studentsApi.list({ schoolId, size: 1 }),
        ]);
        setStats((s) => ({ ...s, students: sRes.data.totalElements || 0 }));
        setGradeData([
          { grade: "KG1-2", count: 120 },
          { grade: "P1-2", count: 210 },
          { grade: "P3-4", count: 195 },
          { grade: "P5-6", count: 175 },
          { grade: "JHS1", count: 98 },
          { grade: "JHS2", count: 87 },
          { grade: "JHS3", count: 65 },
        ]);
        setAttData([
          { name: "Present", value: 87 },
          { name: "Absent", value: 8 },
          { name: "Late", value: 3 },
          { name: "Excused", value: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) return <Spinner center />;

  return (
    <div>
      <PageHeader
        title="School Dashboard"
        subtitle="Overview of your school's records and activity"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard
          icon="user"
          value={stats.students}
          label="Total Students"
          colorClass="teal"
        />
        <StatCard
          icon="check"
          value="950"
          label="Active Students"
          colorClass="green"
        />
        <StatCard
          icon="calendar"
          value="93.1%"
          label="Today's Attendance"
          colorClass="blue"
        />
        <StatCard
          icon="transfer"
          value="3"
          label="Pending Transfers"
          colorClass="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <span className="card-title">Students by Grade Level</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeData}>
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary-400)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Attendance</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={attData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  label={({ name, value }) => `${value}%`}
                >
                  {attData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
