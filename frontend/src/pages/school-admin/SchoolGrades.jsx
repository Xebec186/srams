import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner, EmptyState } from "../../components/common";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SchoolGrades() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
      if (tRes.data.length)
        setSelectedTerm(String(tRes.data[tRes.data.length - 1].id));
    }
    loadRef();
  }, []);

  const load = async () => {
    if (!selectedGrade || !selectedTerm || !schoolId) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await performanceApi.getClassResults({
        schoolId,
        gradeLevelId: selectedGrade,
        termId: selectedTerm,
      });
      setResults(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const subjectSummary = subjects
    .map((sub) => {
      const subResults = results.filter((r) => r.subjectId === sub.id);
      const avg =
        subResults.length > 0
          ? (
              subResults.reduce((s, r) => s + (r.totalScore || 0), 0) /
              subResults.length
            ).toFixed(1)
          : null;
      return {
        name: sub.name,
        code: sub.code,
        avg: avg ? Number(avg) : 0,
        count: subResults.length,
      };
    })
    .filter((s) => s.count > 0);

  const gradeDist = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]
    .map((g) => ({
      grade: g,
      count: results.filter((r) => r.grade === g).length,
    }))
    .filter((g) => g.count > 0);

  return (
    <div>
      <PageHeader
        title="Academic Grades"
        subtitle="View class performance records by grade level and term"
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-group mb-0 min-w-[160px]">
              <label className="form-label">Grade Level</label>
              <select
                className="form-control"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">Select grade...</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0 min-w-[160px]">
              <label className="form-label">Term</label>
              <select
                className="form-control"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    Term {t.termNumber} — {t.academicYearLabel}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={load}
              disabled={loading || !selectedGrade}
            >
              {loading ? "Loading..." : "View Results"}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner center />
      ) : (
        searched &&
        (results.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No grades recorded"
            description="No scores have been entered for this grade and term."
          />
        ) : (
          <>
            {subjectSummary.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <span className="card-title">Subject Averages</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={subjectSummary}>
                      <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v) => `${v}/100`}
                        labelFormatter={(l) => {
                          const s = subjectSummary.find((x) => x.code === l);
                          return s?.name || l;
                        }}
                      />
                      <Bar
                        dataKey="avg"
                        fill="var(--color-primary-400)"
                        radius={[4, 4, 0, 0]}
                        name="Average Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Grade Distribution</span>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={gradeDist}>
                      <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Students"
                        radius={[4, 4, 0, 0]}
                        fill="var(--color-accent-400)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Class Summary</span>
                </div>
                <div className="card-body">
                  {[
                    ["Total Records", results.length],
                    [
                      "Unique Students",
                      new Set(results.map((r) => r.studentId)).size,
                    ],
                    ["Subjects Recorded", subjectSummary.length],
                    [
                      "Overall Average",
                      results.length > 0
                        ? `${(results.reduce((s, r) => s + (r.totalScore || 0), 0) / results.length).toFixed(1)}/100`
                        : "—",
                    ],
                    [
                      "Pass Rate (≥ 50)",
                      results.length > 0
                        ? `${((results.filter((r) => (r.totalScore || 0) >= 50).length / results.length) * 100).toFixed(1)}%`
                        : "—",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between py-2 border-b border-neutral-100 text-sm"
                    >
                      <span className="text-neutral-500">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">All Records</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>USID</th>
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
                        <td className="font-medium">{r.studentName}</td>
                        <td>
                          <span className="usid-tag">{r.studentUsid}</span>
                        </td>
                        <td className="text-sm">{r.subjectName}</td>
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
          </>
        ))
      )}
    </div>
  );
}
