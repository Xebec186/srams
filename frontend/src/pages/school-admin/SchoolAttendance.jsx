import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";
import { formatDate, formatPercent } from "../../utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SchoolAttendance() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const load = async () => {
    if (!schoolId) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await attendanceApi.getSchoolReport(schoolId, {
        from: fromDate,
        to: toDate,
      });
      setReport(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  const chartData = Object.values(
    report.reduce((acc, r) => {
      const key = r.attendanceDate;
      if (!acc[key]) acc[key] = { date: key, present: 0, absent: 0, total: 0 };
      acc[key].present += r.present || 0;
      acc[key].absent += r.absent || 0;
      acc[key].total += r.totalMarked || 0;
      return acc;
    }, {}),
  ).map((d) => ({
    ...d,
    rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    dateLabel: new Date(d.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
  }));

  const overallRate =
    chartData.length > 0
      ? (chartData.reduce((s, d) => s + d.rate, 0) / chartData.length).toFixed(
          1,
        )
      : null;

  return (
    <div>
      <PageHeader
        title="Attendance Records"
        subtitle="View and analyse attendance across date ranges"
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex flex-wrap items-end gap-4">
            <div className="form-group mb-0 min-w-[160px]">
              <label className="form-label">From Date</label>
              <input
                className="form-control"
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="form-group mb-0 min-w-[160px]">
              <label className="form-label">To Date</label>
              <input
                className="form-control"
                type="date"
                value={toDate}
                min={fromDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner center />
      ) : (
        searched && (
          <>
            {overallRate !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[
                  {
                    icon: "calendar",
                    label: "Average Attendance Rate",
                    value: `${overallRate}%`,
                    color: "teal",
                  },
                  {
                    icon: "check",
                    label: "Total Present",
                    value: chartData
                      .reduce((s, d) => s + d.present, 0)
                      .toLocaleString(),
                    color: "green",
                  },
                  {
                    icon: "x",
                    label: "Total Absent",
                    value: chartData
                      .reduce((s, d) => s + d.absent, 0)
                      .toLocaleString(),
                    color: "red",
                  },
                  {
                    icon: "list",
                    label: "Days Covered",
                    value: chartData.length,
                    color: "blue",
                  },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className="stat-card">
                    <div className={`stat-icon ${color}`}>{icon}</div>
                    <div>
                      <div className="stat-value">{value}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {chartData.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <div className="card-title">Daily Attendance Rate (%)</div>
                  <div className="text-sm text-neutral-400">
                    {formatDate(fromDate)} — {formatDate(toDate)}
                  </div>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-neutral-100)"
                      />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar
                        dataKey="rate"
                        fill="var(--color-primary-400)"
                        radius={[4, 4, 0, 0]}
                        name="Attendance Rate"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <span className="card-title">Daily Breakdown</span>
              </div>
              {report.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-sm">
                  No attendance records found for the selected date range.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Period</th>
                        <th>Total Marked</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Excused</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.map((r, i) => (
                        <tr key={i}>
                          <td>{formatDate(r.attendanceDate)}</td>
                          <td className="text-sm">
                            <span
                              className={`badge ${r.period === "MORNING" ? "badge-primary" : "badge-info"}`}
                            >
                              {r.period}
                            </span>
                          </td>
                          <td>{r.totalMarked}</td>
                          <td className="text-success font-medium">
                            {r.present}
                          </td>
                          <td className="text-danger font-medium">
                            {r.absent}
                          </td>
                          <td className="text-warning">{r.late}</td>
                          <td className="text-info">{r.excused}</td>
                          <td>
                            <span
                              className={`font-semibold ${r.attendanceRate >= 90 ? "text-success" : r.attendanceRate >= 75 ? "text-warning" : "text-danger"}`}
                            >
                              {formatPercent(r.attendanceRate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
