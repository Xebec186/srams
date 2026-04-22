import React, { useState, useEffect } from "react";
import {
  studentsApi,
  attendanceApi,
  performanceApi,
  referenceApi,
} from "../../api";
import { Spinner, Badge } from "../../components/common";
import { formatDate, getStatusBadgeClass, formatPercent } from "../../utils";

const TABS = ["Profile", "Attendance", "Results"];

export default function StudentDetail({ studentId }) {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("Profile");
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, tRes] = await Promise.all([
          studentsApi.getById(studentId),
          referenceApi
            .getCurrentYear()
            .then((y) => referenceApi.getTerms(y.data.id)),
        ]);
        setStudent(sRes.data);
        setTerms(tRes.data);
        if (tRes.data.length > 0)
          setSelectedTerm(tRes.data[tRes.data.length - 1].id);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  useEffect(() => {
    if (!selectedTerm) return;
    async function loadTabData() {
      setDataLoading(true);
      try {
        if (tab === "Attendance") {
          const r = await attendanceApi.getStudentSummary(
            studentId,
            selectedTerm,
          );
          setAttendance(r.data);
        } else if (tab === "Results") {
          const r = await performanceApi.getStudentResults(
            studentId,
            selectedTerm,
          );
          setResults(r.data);
        }
      } finally {
        setDataLoading(false);
      }
    }
    if (tab !== "Profile") loadTabData();
  }, [tab, selectedTerm, studentId]);

  if (loading) return <Spinner center />;
  if (!student) return <div>Student not found.</div>;

  return (
    <div>
      {/* Header */}
      <div
        className="rounded-lg mb-5"
        style={{ background: "var(--color-primary-900)", padding: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--color-primary-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {student.fullName?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
              {student.fullName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-primary-200)",
                marginTop: 6,
              }}
            >
              <span
                className="usid-tag"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                {student.usid}
              </span>
            </div>
          </div>
          <Badge className={getStatusBadgeClass(student.status)}>
            {student.status}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-5 gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm ${tab === t ? "font-semibold" : "font-medium"}`}
            style={
              tab === t
                ? {
                    color: "var(--color-primary-600)",
                    borderBottom: "2px solid var(--color-primary-600)",
                    marginBottom: -1,
                  }
                : {
                    color: "var(--color-neutral-500)",
                    background: "transparent",
                    border: "none",
                  }
            }
          >
            {t}
          </button>
        ))}

        {tab !== "Profile" && (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>
              Term:
            </label>
            <select
              className="form-control"
              style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
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
        )}
      </div>

      {/* Profile Tab */}
      {tab === "Profile" && (
        <div className="grid grid-cols-2 gap-5">
          <ProfileSection
            title="Personal Details"
            rows={[
              ["Date of Birth", formatDate(student.dateOfBirth)],
              ["Gender", student.gender],
              ["Nationality", student.nationality],
              ["Address", student.address || "—"],
            ]}
          />
          <ProfileSection
            title="School Details"
            rows={[
              ["School", student.schoolName],
              ["Grade", student.gradeCode],
              ["Enrolment Date", formatDate(student.enrollmentDate)],
              ["Enrolment Year", student.enrollmentYear],
            ]}
          />
          <ProfileSection
            title="Guardian Information"
            rows={[
              ["Guardian Name", student.guardianName || "—"],
              ["Phone", student.guardianPhone || "—"],
              ["Relation", student.guardianRelation || "—"],
            ]}
          />
        </div>
      )}

      {/* Attendance Tab */}
      {tab === "Attendance" &&
        (dataLoading ? (
          <Spinner center />
        ) : attendance ? (
          <div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="stat-card">
                <div
                  className="stat-value"
                  style={{ color: "var(--color-success-500)" }}
                >
                  {attendance.present}
                </div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-card">
                <div
                  className="stat-value"
                  style={{ color: "var(--color-danger-500)" }}
                >
                  {attendance.absent}
                </div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-card">
                <div
                  className="stat-value"
                  style={{ color: "var(--color-warning-500)" }}
                >
                  {attendance.late}
                </div>
                <div className="stat-label">Late</div>
              </div>
              <div className="stat-card">
                <div
                  className="stat-value"
                  style={{ color: "var(--color-info-500)" }}
                >
                  {attendance.excused}
                </div>
                <div className="stat-label">Excused</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-neutral-500">
                      Attendance Rate
                    </div>
                    <div className="text-3xl font-bold text-primary-600">
                      {formatPercent(attendance.percentPresent)}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-400">
                    {attendance.total} total sessions
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-neutral-400 text-sm">
            No attendance data for this term.
          </div>
        ))}

      {/* Results Tab */}
      {tab === "Results" &&
        (dataLoading ? (
          <Spinner center />
        ) : results.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class Score</th>
                  <th>Exam Score</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Remarks</th>
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
                    <td className="text-sm text-neutral-400">
                      {r.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-neutral-400 text-sm">
            No results recorded for this term.
          </div>
        ))}
    </div>
  );
}

function ProfileSection({ title, rows }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="font-semibold">{title}</div>
      </div>
      <div className="card-body">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-2 border-b border-neutral-100 text-sm"
          >
            <span className="text-neutral-500">{label}</span>
            <span className="font-medium text-right max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
