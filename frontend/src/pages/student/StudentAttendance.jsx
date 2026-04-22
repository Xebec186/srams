import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";
import { formatDate, getAttendanceCellClass, formatPercent } from "../../utils";

export default function StudentAttendance() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
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
    Promise.all([
      attendanceApi.getStudentByTerm(studentId, selectedTerm),
      attendanceApi.getStudentSummary(studentId, selectedTerm),
    ])
      .then(([rRes, sRes]) => {
        setRecords(rRes.data);
        setSummary(sRes.data);
      })
      .finally(() => setLoading(false));
  }, [selectedTerm, studentId]);

  return (
    <div>
      <PageHeader
        title="My Attendance"
        subtitle="View your attendance record by term"
      />

      <div className="flex items-center gap-3 mb-4">
        <label className="form-label mb-0">Term:</label>
        <select
          className="form-control w-56"
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
        >
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              Term {t?.termNumber} — {t?.academicYearLabel}
            </option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {[
            {
              label: "Attendance Rate",
              value: formatPercent(summary.percentPresent),
              color: "text-primary-600",
            },
            {
              label: "Present",
              value: summary.present,
              color: "text-success-600",
            },
            {
              label: "Absent",
              value: summary.absent,
              color: "text-danger-600",
            },
            {
              label: "Late",
              value: summary.late,
              color: "text-warning-600",
            },
            {
              label: "Excused",
              value: summary.excused,
              color: "text-info-600",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <Spinner center />
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance Records</span>
          </div>
          {records.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              No attendance records for this term.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.attendanceDate)}</td>
                      <td className="text-sm">{r.period}</td>
                      <td>
                        <span
                          className={`att-cell ${getAttendanceCellClass(r.status)} inline-flex px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="text-sm text-neutral-400">
                        {r.absenceReason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
