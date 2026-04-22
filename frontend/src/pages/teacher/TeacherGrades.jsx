import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentsApi, performanceApi, referenceApi } from "../../api";
import { PageHeader, Spinner } from "../../components/common";

export default function TeacherGrades() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    if (!selectedGrade || !user?.schoolId) return;
    setLoading(true);
    studentsApi
      .list({ schoolId: user.schoolId, gradeLevelId: selectedGrade, size: 100 })
      .then((r) => {
        const list = r.data.content || [];
        setStudents(list);
        const init = {};
        list.forEach((s) => {
          init[s.id] = { classScore: "", examScore: "" };
        });
        setScores(init);
      })
      .finally(() => setLoading(false));
  }, [selectedGrade, user]);

  const setScore = (studentId, field, value) => {
    setSaved(false);
    setScores((s) => ({
      ...s,
      [studentId]: { ...s[studentId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedTerm) {
      alert("Please select a subject and term before submitting.");
      return;
    }
    setSaving(true);
    try {
      const promises = students
        .filter(
          (s) =>
            scores[s.id]?.classScore !== "" || scores[s.id]?.examScore !== "",
        )
        .map((s) =>
          performanceApi.recordScore({
            studentId: s.id,
            termId: Number(selectedTerm),
            subjectId: Number(selectedSubject),
            gradeLevelId: Number(selectedGrade),
            classScore:
              scores[s.id]?.classScore !== ""
                ? Number(scores[s.id].classScore)
                : null,
            examScore:
              scores[s.id]?.examScore !== ""
                ? Number(scores[s.id].examScore)
                : null,
          }),
        );
      await Promise.all(promises);
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save grades.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Enter Grades"
        subtitle="Record class and exam scores for your students"
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="form-label">Subject</label>
              <select
                className="form-control"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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

      {saved && (
        <div className="alert alert-success">Grades saved successfully.</div>
      )}

      {selectedGrade &&
        (loading ? (
          <Spinner center />
        ) : students.length === 0 ? (
          <div className="card p-8 text-center text-neutral-400 text-sm">
            No students in this grade.
          </div>
        ) : (
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span className="card-title">{students.length} Students</span>
              <div className="text-sm text-neutral-400">
                Class: max 30 • Exam: max 70 • Total: max 100
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>USID</th>
                    <th>Class Score (/ 30)</th>
                    <th>Exam Score (/ 70)</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const sc = scores[s.id] || {
                      classScore: "",
                      examScore: "",
                    };
                    const classVal = parseFloat(sc.classScore);
                    const examVal = parseFloat(sc.examScore);
                    const total =
                      !isNaN(classVal) && !isNaN(examVal)
                        ? classVal + examVal
                        : null;
                    const grade = total !== null ? computeGrade(total) : "—";
                    return (
                      <tr key={s.id}>
                        <td className="text-neutral-400 text-sm">{i + 1}</td>
                        <td className="font-medium">{s.fullName}</td>
                        <td>
                          <span className="usid-tag">{s.usid}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.5"
                            className="form-control w-24"
                            value={sc.classScore}
                            onChange={(e) =>
                              setScore(s.id, "classScore", e.target.value)
                            }
                            placeholder="0–30"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="70"
                            step="0.5"
                            className="form-control w-24"
                            value={sc.examScore}
                            onChange={(e) =>
                              setScore(s.id, "examScore", e.target.value)
                            }
                            placeholder="0–70"
                          />
                        </td>
                        <td className="font-semibold text-lg">
                          {total !== null ? total.toFixed(1) : "—"}
                        </td>
                        <td>
                          {total !== null && (
                            <span className={`grade-pill grade-${grade}`}>
                              {grade}
                            </span>
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
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save All Grades"}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

function computeGrade(total) {
  if (total >= 90) return "A1";
  if (total >= 80) return "B2";
  if (total >= 70) return "B3";
  if (total >= 60) return "C4";
  if (total >= 55) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
}
