import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { schoolsApi } from "../../api/index.js";
import { PageHeader, Spinner, StatCard } from "../../components/common";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#059669", "#dc2626", "#d97706", "#2563eb"];

export default function SchoolDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [attData, setAttData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.schoolId) {
        setLoading(false);
        return;
      }

      try {
        const schoolId = user.schoolId;
        const today = new Date().toISOString().split("T")[0];

        const res = await schoolsApi.getStats(schoolId, today);
        const data = res.data;

        setStats(data);
        setAttData([
          { name: "Present", value: data.present || 0 },
          { name: "Absent", value: data.absent || 0 },
          { name: "Late", value: data.late || 0 },
          { name: "Excused", value: data.excused || 0 },
        ]);
      } catch (err) {
        console.error("School dashboard load failed:", err);
        setStats(null);
        setAttData([]);
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
          icon="users"
          value={stats?.totalStudents ?? 0}
          label="Total Students"
          color="blue"
        />
        <StatCard
          icon="check"
          value={stats?.activeStudents ?? 0}
          label="Active Students"
          color="green"
        />
        <StatCard
          icon="calendar"
          value={
            typeof stats?.attendanceRate === "number"
              ? `${stats.attendanceRate}%`
              : "—"
          }
          label="Today's Attendance"
          color="purple"
        />
        <StatCard
          icon="star"
          value={stats?.pendingTransfers ?? 0}
          label="Pending Transfers"
          color="amber"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Today's Attendance Breakdown</span>
        </div>
        <div className="card-body">
          {attData.length === 0 || !stats ? (
            <div className="py-12 text-center text-neutral-500">
              No attendance data available for today.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={false}
                >
                  {attData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value, entry) => {
                    const total = attData.reduce((sum, d) => sum + d.value, 0);
                    const percent = total
                      ? ((entry.payload.value / total) * 100).toFixed(0)
                      : 0;
                    return `${value} (${percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
