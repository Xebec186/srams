import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi, attendanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const STATUS_COLORS = {
  PRESENT: { bg: "bg-success-600", color: "text-white" },
  ABSENT: { bg: "bg-danger-600", color: "text-white" },
  LATE: { bg: "bg-warning-600", color: "text-white" },
  EXCUSED: { bg: "bg-info-600", color: "text-white" },
};

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState("MORNING");
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadRef() {
      const [gRes, yRes] = await Promise.all([
        referenceApi.getGradeLevels(),
        referenceApi.getCurrentYear(),
      ]);
      setGrades(gRes.data);
      const t = await referenceApi.getTerms(yRes.data.id);
      setTerms(t.data);
      if (t.data.length > 0)
        setSelectedTerm(String(t.data[t.data.length - 1].id));
    }
    loadRef();
  }, []);

  useEffect(() => {
    if (!selectedGrade || !user?.schoolId) return;
    setLoading(true);
    setSubmitted(false);
    studentsApi
      .list({ schoolId: user.schoolId, gradeLevelId: selectedGrade, size: 100 })
      .then((r) => {
        const list = r.data.content || [];
        setStudents(list);
        const initial = {};
        list.forEach((s) => {
          initial[s.id] = { status: "PRESENT", reason: "" };
        });
        setMarks(initial);
      })
      .finally(() => setLoading(false));
  }, [selectedGrade, user]);

  const setStatus = (studentId, status) =>
    setMarks((m) => ({ ...m, [studentId]: { ...m[studentId], status } }));
  const setReason = (studentId, reason) =>
    setMarks((m) => ({ ...m, [studentId]: { ...m[studentId], reason } }));
  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = { status, reason: "" };
    });
    setMarks(updated);
  };

  const handleSubmit = async () => {
    if (!selectedTerm) return;
    setSubmitting(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        attendanceDate: date,
        period,
        termId: Number(selectedTerm),
        status: marks[s.id]?.status || "PRESENT",
        absenceReason: marks[s.id]?.reason || null,
      }));
      await attendanceApi.markBulk({ records });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = Object.values(marks).reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subtitle="Record student attendance for your class"
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group mb-0">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                type="date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSubmitted(false);
                }}
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Period</label>
              <select
                className="form-control"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="MORNING">Morning</option>
                <option value="AFTERNOON">Afternoon</option>
              </select>
            </div>
            <div className="form-group mb-0">
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
            <div className="form-group mb-0">
              <label className="form-label">Term</label>
              <select
                className="form-control"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    Term {t.termNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="alert alert-success mb-4">
          Attendance submitted successfully for {students.length} students.
        </div>
      )}

      {selectedGrade &&
        (loading ? (
          <Spinner center />
        ) : students.length === 0 ? (
          <div className="card">
            <div className="p-8 text-center text-neutral-400 text-sm">
              No students found for this grade.
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="card-title">{students.length} Students</span>
                {STATUS_OPTIONS.map(
                  (s) =>
                    summary[s] > 0 && (
                      <span
                        key={s}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].color}`}
                      >
                        {summary[s]} {s}
                      </span>
                    ),
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Mark all:</span>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className="btn btn-outline btn-sm text-xs"
                    onClick={() => markAll(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>USID</th>
                    <th className="text-center">Status</th>
                    <th>Reason (if absent)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const mark = marks[s.id] || {
                      status: "PRESENT",
                      reason: "",
                    };
                    return (
                      <tr key={s.id}>
                        <td className="text-neutral-400 text-sm">{i + 1}</td>
                        <td className="font-medium">{s.fullName}</td>
                        <td>
                          <span className="usid-tag">{s.usid}</span>
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            {STATUS_OPTIONS.map((status) => {
                              const active = mark.status === status;
                              const cls = active
                                ? `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].color}`
                                : "bg-neutral-100 text-neutral-500";
                              return (
                                <button
                                  key={status}
                                  onClick={() => setStatus(s.id, status)}
                                  className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}
                                >
                                  {status[0]}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          {["ABSENT", "EXCUSED"].includes(mark.status) && (
                            <input
                              className="form-control"
                              placeholder="Enter reason..."
                              value={mark.reason}
                              onChange={(e) => setReason(s.id, e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-neutral-200 p-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : `Submit Attendance — ${students.length} Students`}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
