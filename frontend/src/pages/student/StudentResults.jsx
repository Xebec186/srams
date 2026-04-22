import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";

export default function StudentResults() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    referenceApi
      .getCurrentYear()
      .then((y) => referenceApi.getTerms(y.data.id))
      .then((t) => {
        setTerms(t.data);
        if (t.data.length)
          setSelectedTerm(String(t.data[t.data.length - 1].id));
      });
  }, []);

  useEffect(() => {
    if (!selectedTerm || !studentId) return;
    setLoading(true);
    performanceApi
      .getReportCard(studentId, selectedTerm)
      .then((r) => setReportCard(r.data))
      .catch(() => setReportCard(null))
      .finally(() => setLoading(false));
  }, [selectedTerm, studentId]);

  return (
    <div>
      <PageHeader
        title="My Results"
        subtitle="Academic performance and report cards"
      />

      <div className="flex items-center gap-3 mb-5">
        <label className="form-label mb-0">Term:</label>
        <select
          className="form-control w-56"
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

      {loading ? (
        <Spinner center />
      ) : reportCard ? (
        <div>
          <div className="report-card card">
            <div className="report-card-header p-4 flex justify-between items-start">
              <div>
                <div className="report-card-school">
                  {reportCard.schoolName}
                </div>
                <div className="report-card-title">Academic Report Card</div>
                <div className="report-card-period">
                  Term {reportCard.termNumber} — {reportCard.academicYear} |{" "}
                  {reportCard.gradeName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary-300">Student</div>
                <div className="text-sm font-semibold text-white">
                  {reportCard.studentName}
                </div>
                <div className="mt-2">
                  <span className="usid-tag bg-white/10 border-white/20 text-white text-xs">
                    {reportCard.usid}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-neutral-200">
              {[
                {
                  label: "Average Score",
                  value: `${reportCard.averageScore?.toFixed(1) ?? "—"}%`,
                },
                {
                  label: "Class Position",
                  value: reportCard.classPosition
                    ? `${reportCard.classPosition} of ${reportCard.totalStudents}`
                    : "—",
                },
                {
                  label: "Attendance",
                  value: `${reportCard.attendancePct?.toFixed(1) ?? "—"}%`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-4 text-center border-r border-neutral-200"
                >
                  <div className="text-2xl font-bold text-primary-600">
                    {value}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Class Score (/ 30)</th>
                    <th>Exam Score (/ 70)</th>
                    <th>Total (/ 100)</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportCard.subjects || []).map((s) => (
                    <tr key={s.subjectId}>
                      <td className="font-medium">{s.subjectName}</td>
                      <td>{s.classScore ?? "—"}</td>
                      <td>{s.examScore ?? "—"}</td>
                      <td className="font-semibold text-lg">
                        {s.totalScore ?? "—"}
                      </td>
                      <td>
                        {s.grade && (
                          <span className={`grade-pill grade-${s.grade}`}>
                            {s.grade}
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-neutral-400">
                        {s.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportCard.teacherRemark && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 rounded-b">
                <div className="text-xs font-semibold text-neutral-500 uppercase">
                  Class Teacher's Remarks
                </div>
                <div className="text-sm text-neutral-700 mt-2">
                  {reportCard.teacherRemark}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center text-neutral-400">
          No results available for the selected term.
        </div>
      )}
    </div>
  );
}
