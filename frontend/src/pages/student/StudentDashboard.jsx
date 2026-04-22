import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceApi, performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner, StatCard } from "../../components/common";
import { formatPercent } from "../../utils";
import { jwtDecode } from "jwt-decode";

export default function StudentDashboard() {
  const { user } = useAuth();
  const token = user?.token;
  // const decodedToken = jwtDecode(token);
  // const studentId = decodedToken?.studentId;
  const studentId = "111"; // Using mock student ID for testing

  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    async function load() {
      try {
        const yRes = await referenceApi.getCurrentYear();
        const tRes = await referenceApi.getTerms(yRes.data.id);
        if (!tRes.data.length) {
          setSummary(null);
          setResults([]);
          setLoading(false);
          return;
        }
        const latestTerm = tRes.data[tRes.data.length - 1];
        const [attRes, perfRes] = await Promise.all([
          attendanceApi.getStudentSummary(studentId, latestTerm.id),
          performanceApi.getStudentResults(studentId, latestTerm.id),
        ]);
        setSummary(attRes.data);
        setResults(perfRes.data);
      } catch (error) {
        console.error("Error loading student dashboard:", error);
        setSummary(null);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const avgScore =
    results.length > 0
      ? (
          results.reduce((a, r) => a + (r.totalScore || 0), 0) / results.length
        ).toFixed(1)
      : "—";

  if (loading) return <Spinner center />;

  if (!summary && !results.length) {
    return (
      <div>
        <PageHeader
          title={`Hello, ${user?.fullName?.split(" ")[0]}`}
          subtitle="Your academic records and attendance for the current term"
        />
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-neutral-500">
              No data available. Please check back later or contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.fullName?.split(" ")[0]}`}
        subtitle="Your academic records and attendance for the current term"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard
          icon="calendar"
          value={formatPercent(summary?.attendancePct)}
          label="Attendance Rate"
          colorClass="teal"
        />
        <StatCard
          icon="check"
          value={summary?.presentCount ?? "—"}
          label="Days Present"
          colorClass="green"
        />
        <StatCard
          icon="x"
          value={summary?.absentCount ?? "—"}
          label="Days Absent"
          colorClass="red"
        />
        <StatCard
          icon="chart"
          value={avgScore}
          label="Average Score"
          colorClass="blue"
        />
      </div>

      {results.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Current Term Results</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class Score</th>
                  <th>Exam Score</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.subjectName}</td>
                    <td>{r.classScore ?? "—"}</td>
                    <td>{r.examScore ?? "—"}</td>
                    <td className="font-semibold">{r.totalScore ?? "—"}</td>
                    <td>
                      {r.grade && (
                        <span className={`grade-pill grade-${r.grade}`}>
                          {r.grade}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
