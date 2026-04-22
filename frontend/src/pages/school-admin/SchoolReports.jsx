import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceApi, performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";
import { formatPercent } from "../../utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";

export default function SchoolReports() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function loadRef() {
      const [gRes, sRes, yRes] = await Promise.all([
        referenceApi.getGradeLevels(),
        referenceApi.getSubjects(),
        referenceApi.getCurrentYear(),
      ]);
      setGrades(gRes.data);
      setSubjects(sRes.data);
      const tRes = await referenceApi.getTerms(yRes.data.id);
      setTerms(tRes.data);
      if (tRes.data.length) {
        const latest = String(tRes.data[tRes.data.length - 1].id);
        setSelectedTerm(latest);
      }
    }
    loadRef();
  }, []);

  const generateReport = async () => {
    if (!selectedTerm || !schoolId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5)
        .toISOString()
        .split("T")[0];

      const [attRes, perfRes] = await Promise.all([
        attendanceApi.getSchoolReport(schoolId, {
          from: thirtyDaysAgo,
          to: today,
        }),
        performanceApi.getClassResults({
          schoolId,
          termId: selectedTerm,
          gradeLevelId: grades[0]?.id,
        }),
      ]);

      const attRecords = Array.isArray(attRes.data)
        ? attRes.data
        : attRes.data
          ? [
              {
                attendanceDate: attRes.data.to || today,
                present: attRes.data.present || 0,
                totalMarked: attRes.data.total || 0,
              },
            ]
          : [];
      const perfRecords = Array.isArray(perfRes.data) ? perfRes.data : [];

      const attByDate = {};
      attRecords.forEach((r) => {
        if (!attByDate[r.attendanceDate])
          attByDate[r.attendanceDate] = { present: 0, total: 0 };
        attByDate[r.attendanceDate].present += r.present || 0;
        attByDate[r.attendanceDate].total += r.totalMarked || 0;
      });
      const attTrend = Object.entries(attByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, d]) => ({
          date: new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
        }));

      const subjectAvg = subjects
        .map((sub) => {
          const subPerf = perfRecords.filter((r) => r.subjectId === sub.id);
          const avg =
            subPerf.length > 0
              ? subPerf.reduce((s, r) => s + (r.totalScore || 0), 0) /
                subPerf.length
              : 0;
          return { subject: sub.code, avg: Math.round(avg) };
        })
        .filter((s) => s.avg > 0);

      const overallAttRate =
        attTrend.length > 0
          ? (
              attTrend.reduce((s, d) => s + d.rate, 0) / attTrend.length
            ).toFixed(1)
          : null;
      const overallPerfAvg =
        perfRecords.length > 0
          ? (
              perfRecords.reduce((s, r) => s + (r.totalScore || 0), 0) /
              perfRecords.length
            ).toFixed(1)
          : null;

      setReportData({
        attTrend,
        subjectAvg,
        overallAttRate,
        overallPerfAvg,
        perfCount: perfRecords.length,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="School Reports"
        subtitle="Comprehensive attendance and performance analytics"
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-group mb-0">
              <label className="form-label">Term</label>
              <select
                className="form-control min-w-[220px]"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    Term {t.termNumber} — {t.academicYear?.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner center />
      ) : (
        reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="stat-card">
                <div className="stat-icon teal">calendar</div>
                <div>
                  <div className="stat-value">
                    {reportData.overallAttRate
                      ? `${reportData.overallAttRate}%`
                      : "—"}
                  </div>
                  <div className="stat-label">
                    Avg Attendance Rate (30 days)
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">chart</div>
                <div>
                  <div className="stat-value">
                    {reportData.overallPerfAvg
                      ? `${reportData.overallPerfAvg}/100`
                      : "—"}
                  </div>
                  <div className="stat-label">Avg Academic Score</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">notes</div>
                <div>
                  <div className="stat-value">{reportData.perfCount}</div>
                  <div className="stat-label">Grade Records This Term</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card lg:col-span-2">
                <div className="card-header">
                  <span className="card-title">
                    Attendance Trend — Last 14 Days
                  </span>
                </div>
                <div className="card-body">
                  {reportData.attTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={reportData.attTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-neutral-100)"
                        />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="var(--color-primary-500)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "var(--color-primary-500)" }}
                          name="Attendance Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="p-8 text-center text-neutral-400 text-sm">
                      No attendance data in the last 30 days.
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Subject Performance</span>
                </div>
                <div className="card-body">
                  {reportData.subjectAvg.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={reportData.subjectAvg}>
                        <PolarGrid />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 11 }}
                        />
                        <Radar
                          name="Avg Score"
                          dataKey="avg"
                          stroke="var(--color-primary-500)"
                          fill="var(--color-primary-400)"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="p-8 text-center text-neutral-400 text-sm">
                      No performance data for this term.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
